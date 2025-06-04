import { EventEmitter } from 'events';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

import { logInfo } from '../utils/logger';
import { FyloNode, FyloEdge } from '../types/graph';

// AI Service Configuration
class LLMService extends EventEmitter {
  private anthropic: Anthropic;
  private readonly model: string = 'claude-sonnet-4-20250514';
  private readonly maxTokens: number = 50000;

  // Processing state
  private textBuffer: string = '';
  private currentUUID: string = '';
  private shouldUpdateID: boolean = true;
  private currentNode: FyloNode | null = null;
  private currentEdge: FyloEdge | null = null;
  private labelToId: Map<string, string> = new Map();
  private uuidToId: Map<string, string> = new Map();
  private edgeList: FyloEdge[] = [];
  private isFirstNode: boolean = true;
  private processedEdges: Set<string> = new Set();
  private processedFields: Set<string> = new Set();
  private processedNodes: Set<string> = new Set();
  private nodeCount: number = 0;
  private edgeCount: number = 0;
  private completionTimer: NodeJS.Timeout | null = null;
  private extractionProgress: {
    totalTokensReceived: number;
    lastProgressCheck: number;
    hasReceivedMinimumContent: boolean;
  } = {
    totalTokensReceived: 0,
    lastProgressCheck: Date.now(),
    hasReceivedMinimumContent: false
  };

  // Parsing keys for structured data extraction
  private readonly parsingKeys = [
    '(id: ',
    ', node_type: ',
    ', title: ',
    ', description: ',
    ', citation: ',
    '(source_id: ',
    ', target_id: ',
    ', edge_type: '
  ];

  constructor() {
    super();
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    if (!process.env.ANTHROPIC_API_KEY) {
      logInfo('ANTHROPIC_API_KEY environment variable is required');
      throw new Error('Missing Anthropic API key');
    }
  }

  /**
   * Send message method for backward compatibility with webSocketClient
   */
  sendMessage = async (event: string, payload: { document: string; graph_id: string; type: 'text' | 'pdf' }): Promise<void> => {
    if (event === 'chat') {
      await this.processChat(payload);
    }
  }

  /**
   * Process chat message and generate streaming AI response
   */
  processChat = async (payload: { document: string; graph_id: string; type: 'text' | 'pdf' }): Promise<void> => {
    try {
      logInfo(`Processing chat for graph: ${payload.graph_id}`);
      
      // Reset processing state
      this.resetState(payload.graph_id);

      const systemPrompt = this.generateSystemPrompt();
      const userMessage = this.formatUserMessage(payload);

      // Stream AI response
      const stream = await this.anthropic.messages.stream({
        messages: [
          { role: 'user', content: userMessage }
        ],
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
      });

      // Handle streaming response
      stream.on('text', (text: string) => {
        this.handleStreamingText(text, payload.graph_id);
      });

      stream.on('error', (error: any) => {
        logInfo(`Anthropic streaming error: ${error.message}`);
        this.emit('chat_error', error);
      });

      stream.on('end', () => {
        this.logExtractionSummary();
        logInfo('AI chat processing completed');
        this.emit('chat_complete', true);
      });

    } catch (error) {
      logInfo(`Error processing chat: ${(error as Error).message}`);
      this.emit('chat_error', error);
    }
  }

  /**
   * Handle streaming text from AI response
   */
  handleStreamingText = (text: string, graphId: string): void => {
    // Add debugging for all incoming text
    logInfo(`📥 Streaming text received (${text.length} chars): "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    
    // Update progress tracking
    this.extractionProgress.totalTokensReceived += text.length;
    
    this.textBuffer += text;
    logInfo(`📝 Updated textBuffer (${this.textBuffer.length} chars total)`);
    
    // Log buffer content every 500 characters for debugging
    if (this.textBuffer.length % 500 === 0 || this.textBuffer.length > 1000) {
      logInfo(`📋 Current textBuffer content: "${this.textBuffer.substring(Math.max(0, this.textBuffer.length - 200))}"`);
    }

    // Parse structured data from the streaming text buffer
    this.parseStructuredData(graphId, this.textBuffer);
  }

  /**
   * Parse and extract structured data from text buffer
   */
  parseStructuredData = (graphId: string, text: string): void => {
    logInfo(`🔍 Parsing textBuffer for structured data (${text.length} chars)`);
    
    // Track what we've processed in this parsing session
    const currentSessionProcessed = new Set<string>();
    
    // Track processing statistics
    let fieldsProcessed = 0;
    let fieldsSkipped = 0;
    
    // Track extraction boundaries for buffer trimming
    let lastCompleteExtractionEnd = 0;
    const extractedPositions: number[] = [];
    
    for (const key of this.parsingKeys) {
      let keyIndex = text.indexOf(key);
      
      while (keyIndex !== -1) {
        logInfo(`🎯 Found parsing key: "${key}" at index ${keyIndex}`);
        
        // Generate new UUID immediately when detecting start of new node or edge
        if ((key === '(id: ' || key === '(source_id: ') && this.shouldUpdateID) {
          this.currentUUID = uuidv4();
          this.shouldUpdateID = false;
          logInfo(`🆔 Generated new UUID for new ${key === '(id: ' ? 'node' : 'edge'}: ${this.currentUUID}`);
        }
        
        const afterKeyIndex = keyIndex + key.length;
        const textAfterKey = text.substring(afterKeyIndex);
        logInfo(`🔎 Text after key: "${textAfterKey.substring(0, 50)}${textAfterKey.length > 50 ? '...' : ''}"`);
        
        // Try to extract a complete quoted value
        const quotedMatch = textAfterKey.match(/^"([^"]*)"(?:\s*[,)])/);
        if (quotedMatch) {
          const value = quotedMatch[1];
          logInfo(`✅ Found complete quoted value for "${key}": "${value}"`);
          
          // Create a unique identifier for this field
          const processingKey = `${this.currentUUID}:${key}:${value}`;
          
          // Only process if we haven't processed this exact key-value combination for this UUID
          if (!this.processedFields.has(processingKey) && !currentSessionProcessed.has(processingKey)) {
            this.processedFields.add(processingKey);
            currentSessionProcessed.add(processingKey);
            this.addOrUpdateField(key, value, graphId);
            logInfo(`✅ Processed new field: ${processingKey}`);
            fieldsProcessed++;
            
            // Track successful extraction position
            const extractionEndPosition = afterKeyIndex + quotedMatch[0].length;
            extractedPositions.push(extractionEndPosition);
            
            // Check if this completes a node or edge
            if (this.isCompleteNodeOrEdge(key)) {
              lastCompleteExtractionEnd = Math.max(lastCompleteExtractionEnd, extractionEndPosition);
              logInfo(`📍 Marked complete extraction boundary at position ${lastCompleteExtractionEnd}`);
            }
          } else {
            logInfo(`⚠️ Already processed field: ${processingKey}, skipping`);
            fieldsSkipped++;
          }
          
          // Move to next occurrence
          keyIndex = text.indexOf(key, keyIndex + 1);
        } else {
          // Check if we have an incomplete quoted value (starts with quote but no closing quote)
          const incompleteMatch = textAfterKey.match(/^"([^"]*)/);
          if (incompleteMatch) {
            logInfo(`⏳ Found incomplete quoted value for "${key}": "${incompleteMatch[1]}", waiting for more data`);
            break; // Wait for more streaming data
          } else {
            // No quote found, try to extract unquoted value until next delimiter
            const unquotedMatch = textAfterKey.match(/^([^,)]+)/);
            if (unquotedMatch) {
              const value = unquotedMatch[1].trim();
              if (value.length > 0) {
                logInfo(`⚠️ Found unquoted value for "${key}": "${value}"`);
                
                const processingKey = `${this.currentUUID}:${key}:${value}`;
                if (!this.processedFields.has(processingKey) && !currentSessionProcessed.has(processingKey)) {
                  this.processedFields.add(processingKey);
                  currentSessionProcessed.add(processingKey);
                  this.addOrUpdateField(key, value, graphId);
                  logInfo(`✅ Processed new unquoted field: ${processingKey}`);
                  fieldsProcessed++;
                  
                  // Track successful extraction position
                  const extractionEndPosition = afterKeyIndex + unquotedMatch[0].length;
                  extractedPositions.push(extractionEndPosition);
                  
                  // Check if this completes a node or edge
                  if (this.isCompleteNodeOrEdge(key)) {
                    lastCompleteExtractionEnd = Math.max(lastCompleteExtractionEnd, extractionEndPosition);
                    logInfo(`📍 Marked complete extraction boundary at position ${lastCompleteExtractionEnd}`);
                  }
                } else {
                  logInfo(`⚠️ Already processed field: ${processingKey}, skipping`);
                  fieldsSkipped++;
                }
              }
            } else {
              logInfo(`❌ No valid value found after key "${key}"`);
            }
            // Move to next occurrence
            keyIndex = text.indexOf(key, keyIndex + 1);
          }
        }
      }
    }
    
    // Strategic buffer trimming after extraction
    this.trimBufferAfterExtraction(lastCompleteExtractionEnd, extractedPositions);
    
    // Log processing statistics
    const totalFields = fieldsProcessed + fieldsSkipped;
    if (totalFields > 0) {
      const processRate = ((fieldsProcessed / totalFields) * 100).toFixed(1);
      logInfo(`📊 Field Processing Statistics: ${fieldsProcessed} processed, ${fieldsSkipped} skipped (${processRate}% processed)`);
    }
  }

  /**
   * Check if a field completion results in a complete node or edge
   */
  isCompleteNodeOrEdge = (key: string): boolean => {
    // Last fields that complete nodes and edges
    return key === ', citation: ' || key === ', edge_type: ';
  }

  /**
   * Strategically trim textBuffer after successful extractions
   */
  trimBufferAfterExtraction = (lastCompleteEnd: number, extractedPositions: number[]): void => {
    if (lastCompleteEnd > 0 && lastCompleteEnd < this.textBuffer.length) {
      const originalLength = this.textBuffer.length;
      const trimPosition = lastCompleteEnd;
      
      // Find a safe trim position (after complete parentheses)
      let safeTrimPosition = trimPosition;
      for (let i = trimPosition; i < Math.min(trimPosition + 50, this.textBuffer.length); i++) {
        if (this.textBuffer[i] === ')') {
          safeTrimPosition = i + 1;
          break;
        }
      }
      
      // Trim the processed content
      this.textBuffer = this.textBuffer.substring(safeTrimPosition);
      
      logInfo(`✂️ Strategic buffer trim: Removed ${safeTrimPosition} chars (${originalLength} → ${this.textBuffer.length})`);
      logInfo(`🧹 Buffer now contains: "${this.textBuffer.substring(0, 100)}${this.textBuffer.length > 100 ? '...' : ''}"`);
      
      // Clean up processed fields for trimmed content - keep only recent entries
      const processedCount = this.processedFields.size;
      if (processedCount > 1000) {
        this.processedFields.clear();
        logInfo(`🧼 Cleared processedFields cache (was ${processedCount} entries)`);
      }
    } else if (this.textBuffer.length > 3000) {
      // Fallback: If no complete extractions but buffer is very large, trim conservatively
      const originalLength = this.textBuffer.length;
      this.textBuffer = this.textBuffer.substring(this.textBuffer.length - 2000);
      this.processedFields.clear();
      logInfo(`🛡️ Fallback buffer trim: ${originalLength} → ${this.textBuffer.length} chars`);
    }
  }

  /**
   * Add or update field data for current node/edge
   */
  addOrUpdateField = (key: string, value: string, graphId: string): void => {
    logInfo(`🔧 Processing field - Key: "${key}", Value: "${value}"`);
    
    // Clean value of extra quotes and whitespace
    const cleanValue = value.replace(/^["'\s]+|["'\s]+$/g, '');
    if (cleanValue.length === 0) {
      logInfo(`⚠️ Empty value after cleaning, skipping field: ${key}`);
      return;
    }
    
    // Generate new UUID if needed
    if (this.shouldUpdateID) {
      this.currentUUID = uuidv4();
      this.shouldUpdateID = false;
      logInfo(`🆔 Generated new UUID: ${this.currentUUID}`);
    }

    // Process node fields
    if (this.isNodeField(key)) {
      logInfo(`🏗️ Processing NODE field: ${key}`);
      this.processNodeField(key, cleanValue, graphId);
    }
    // Process edge fields  
    else if (this.isEdgeField(key)) {
      logInfo(`🔗 Processing EDGE field: ${key}`);
      this.processEdgeField(key, cleanValue, graphId);
    }
    
    // Emit real-time updates to frontend
    this.emit('update_stream', this.currentUUID, key, cleanValue);
    logInfo(`📡 Emitted update_stream event - UUID: ${this.currentUUID}, Key: ${key}, Value: ${cleanValue}`);
  }

  /**
   * Process node field data
   */
  processNodeField = (key: string, value: string, graphId: string): void => {
    logInfo(`🏗️ Creating/updating node with key: ${key}, value: ${value}`);
    
    if (!this.currentNode) {
      this.currentNode = this.createEmptyNode(graphId);
      logInfo(`🆕 Created new empty node: ${JSON.stringify(this.currentNode, null, 2)}`);
    }

    switch (key) {
      case '(id: ':
        this.currentNode.data.internal_id = value;
        logInfo(`📝 Set node internal ID: ${value}`);
        break;
      case ', node_type: ':
        this.currentNode.data.node_type = value;
        logInfo(`🏷️ Set node type: ${value}`);
        break;
      case ', title: ':
        this.currentNode.data.id = value; // Use title as the human-readable ID
        logInfo(`📝 Set node title (data.id): ${value}`);
        break;
      case ', description: ':
        this.currentNode.data.description = value;
        logInfo(`📄 Set node description: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        
        // Complete current node if it exists
        if (this.currentNode.data.internal_id && (this.currentNode.data.id || this.currentNode.data.description)) {
          // Check for duplicate nodes using internal_id
          const nodeIdentifier = this.currentNode.data.internal_id;
          
          if (!this.processedNodes.has(nodeIdentifier)) {
            this.processedNodes.add(nodeIdentifier);
            
            // Set proper position and complete the node
            this.currentNode.position = { x: Math.random() * 800, y: Math.random() * 600 };
            this.currentNode.created_at = new Date();
            
            // If no title was provided, use a truncated description as the title
            if (!this.currentNode.data.id && this.currentNode.data.description) {
              const truncatedDesc = this.currentNode.data.description.length > 50 
                ? this.currentNode.data.description.substring(0, 50) + '...'
                : this.currentNode.data.description;
              this.currentNode.data.id = truncatedDesc;
              logInfo(`📝 Auto-generated title from description: ${truncatedDesc}`);
            }
            
            // Ensure node_type is never empty - assign default if missing
            if (!this.currentNode.data.node_type || this.currentNode.data.node_type.trim() === '') {
              // Try to infer node_type from content if possible
              const description = this.currentNode.data.description?.toLowerCase() || '';
              const title = this.currentNode.data.id?.toLowerCase() || '';
              const content = `${title} ${description}`;
              
              if (content.includes('question') || content.includes('?') || content.includes('what') || content.includes('how') || content.includes('why')) {
                this.currentNode.data.node_type = 'Question';
              } else if (content.includes('study') || content.includes('method') || content.includes('analysis') || content.includes('experiment') || content.includes('investigation')) {
                this.currentNode.data.node_type = 'Investigation';
              } else if (content.includes('data') || content.includes('result') || content.includes('evidence') || content.includes('finding') || content.includes('observation')) {
                this.currentNode.data.node_type = 'Evidence';
              } else {
                this.currentNode.data.node_type = 'Claim';
              }
              logInfo(`⚠️ Missing node_type, inferred: ${this.currentNode.data.node_type} from content`);
            }
            
            // Set default confidence score if not provided
            if (this.currentNode.data.confidence_score === undefined) {
              this.currentNode.data.confidence_score = 0.8; // Default high confidence
            }
            
            // Special handling for first node
            if (this.isFirstNode) {
              this.currentNode.data.is_root = true;
              this.isFirstNode = false;
              logInfo(`🌱 Set as root node`);
            }
            
            logInfo(`✅ COMPLETING NODE: ${JSON.stringify(this.currentNode, null, 2)}`);
            this.emit('add_node', { ...this.currentNode });
            this.labelToId.set(this.currentNode.data.internal_id, this.currentNode.id);
            logInfo(`📍 Mapped label "${this.currentNode.data.internal_id}" to UUID "${this.currentNode.id}"`);
            
            // INCREMENT NODE COUNT HERE
            this.nodeCount++;
            logInfo(`📊 Node count incremented to: ${this.nodeCount}`);
          } else {
            logInfo(`⚠️ Duplicate node detected, skipping: ${nodeIdentifier}`);
          }
          
          // Reset for next node
          this.currentNode = null;
          this.shouldUpdateID = true;
        }
        break;
      case ', citation: ':
        // Create a Citation object from the string value
        this.currentNode.data.citation = {
          title: value,
          ref_id: value
        };
        logInfo(`📄 Set node citation: ${value}`);
        break;
    }
  }

  /**
   * Process edge field data
   */
  processEdgeField = (key: string, value: string, graphId: string): void => {
    logInfo(`🔗 Creating/updating edge with key: ${key}, value: ${value}`);
    
    if (!this.currentEdge) {
      this.currentEdge = this.createEmptyEdge(graphId);
      logInfo(`🆕 Created new empty edge: ${JSON.stringify(this.currentEdge, null, 2)}`);
    }

    switch (key) {
      case '(source_id: ':
        // Handle both UUID and label references
        this.currentEdge.source = this.isUUID(value) ? value : (this.labelToId.get(value) || value);
        logInfo(`🎯 Set edge source: ${value} -> ${this.currentEdge.source}`);
        break;
      case ', target_id: ':
        // Handle both UUID and label references
        this.currentEdge.target = this.isUUID(value) ? value : (this.labelToId.get(value) || value);
        logInfo(`🎯 Set edge target: ${value} -> ${this.currentEdge.target}`);
        break;
      case ', edge_type: ':
        this.currentEdge.data.label = value;
        this.currentEdge.type = 'floating';
        logInfo(`🏷️ Set edge type/label: ${value}`);
        
        // Check if we can create the edge immediately
        if (this.currentEdge.source && this.currentEdge.target && 
            this.currentEdge.source !== this.currentEdge.target) {
          // Create deterministic edge ID to prevent duplicates
          const edgeIdentifier = `${this.currentEdge.source}-${this.currentEdge.target}-${this.currentEdge.data.label || 'default'}`;
          this.currentEdge.id = uuidv4(); // Use a new UUID for each edge but track by identifier
          
          // Check if we've already created this edge relationship
          if (!this.processedEdges.has(edgeIdentifier)) {
            this.processedEdges.add(edgeIdentifier);
            this.currentEdge.created_at = new Date();
            
            logInfo(`✅ COMPLETING EDGE: ${JSON.stringify(this.currentEdge, null, 2)}`);
            this.emit('add_edge', { ...this.currentEdge });
            this.edgeCount++;
          } else {
            logInfo(`⚠️ Duplicate edge detected, skipping: ${edgeIdentifier}`);
          }
          
          // Reset for next edge
          this.currentEdge = null;
          this.shouldUpdateID = true;
        }
        break;
    }
  }

  /**
   * Finalize and emit node creation
   */
  finalizeNode = (graphId: string): void => {
    if (!this.currentNode || !this.currentNode.data.internal_id) {
      return;
    }
    
    // Ensure we have either title or description
    if (!this.currentNode.data.id && !this.currentNode.data.description) {
      logInfo(`⚠️ Node ${this.currentNode.data.internal_id} lacks both title and description, skipping`);
      return;
    }
    
    // Auto-generate title if missing
    if (!this.currentNode.data.id && this.currentNode.data.description) {
      const truncatedDesc = this.currentNode.data.description.length > 50 
        ? this.currentNode.data.description.substring(0, 50) + '...'
        : this.currentNode.data.description;
      this.currentNode.data.id = truncatedDesc;
      logInfo(`📝 Auto-generated title for finalization: ${truncatedDesc}`);
    }
    
    // Ensure node_type
    if (!this.currentNode.data.node_type || this.currentNode.data.node_type.trim() === '') {
      this.currentNode.data.node_type = 'Claim';
      logInfo(`⚠️ Assigning default node_type for finalization: Claim`);
    }
    
    // Special handling for root node
    if (this.isFirstNode) {
      this.currentNode.data.is_root = true;
      this.isFirstNode = false;
      logInfo(`🌱 Set as root node`);
    }
    
    // Set position and emit
    this.currentNode.position = { x: Math.random() * 800, y: Math.random() * 600 };
    this.currentNode.created_at = new Date();
    
    logInfo(`✅ FINALIZING NODE: ${JSON.stringify(this.currentNode, null, 2)}`);
    this.emit('add_node', { ...this.currentNode });
    this.labelToId.set(this.currentNode.data.internal_id, this.currentNode.id);
    
    // Process any pending edges that can now be resolved
    this.processPendingEdges(graphId);
    
    this.nodeCount++;
    this.currentNode = null;
    this.shouldUpdateID = true;
  }

  /**
   * Process pending edges that can now be resolved
   */
  processPendingEdges = (graphId: string): void => {
    const resolvedEdges: FyloEdge[] = [];
    
    this.edgeList.forEach((edge, index) => {
      const sourceId = this.isUUID(edge.source) ? edge.source : this.labelToId.get(edge.source);
      const targetId = this.isUUID(edge.target) ? edge.target : this.labelToId.get(edge.target);
      
      if (sourceId && targetId) {
        const resolvedEdge = {
          ...edge,
          source: sourceId,
          target: targetId,
          created_at: new Date()
        };
        
        this.emit('add_edge', resolvedEdge);
        resolvedEdges.push(resolvedEdge);
      }
    });

    // Remove resolved edges from pending list
    this.edgeList = this.edgeList.filter(edge => !resolvedEdges.includes(edge));
  }

  /**
   * Create empty node template
   */
  createEmptyNode = (graphId: string): FyloNode => {
    return {
      id: this.currentUUID,
      graph_id: graphId,
      type: 'Default',
      position: { x: 0, y: 0 },
      data: {
        id: '',
        description: '',
        node_type: '',
        internal_id: '',
        is_moving: false,
        picker_color: '',
        is_root: false,
        document_content: '',
        comments: [],
        citation: {},
        citations: [],
        confidence_score: 0,
      },
      measured: {
        width: 0,
        height: 0,
      },
      selected: false,
      dragging: false,
      hidden: false,
      created_at: new Date(),
    };
  }

  /**
   * Create empty edge template
   */
  createEmptyEdge = (graphId: string): FyloEdge => {
    return {
      id: this.currentUUID,
      graph_id: graphId,
      type: 'floating',
      source: '',
      target: '',
      data: {
        label: '',
        description: '',
        comments: [],
      },
      created_at: new Date(),
    };
  }

  /**
   * Check if field is related to nodes
   */
  isNodeField = (key: string): boolean => {
    return [
      '(id: ',
      ', node_type: ',
      ', title: ',
      ', description: ',
      ', citation: ',
    ].includes(key);
  }

  /**
   * Check if field is related to edges
   */
  isEdgeField = (key: string): boolean => {
    return [
      '(source_id: ',
      ', target_id: ',
      ', edge_type: ',
    ].includes(key);
  }

  /**
   * Check if value is a valid UUID
   */
  isUUID = (value: string): boolean => {
    return value
      ? (value.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/) ?? [])?.length > 0
      : false;
  }

  /**
   * Reset processing state for new chat session
   */
  resetState = (graphId: string): void => {
    logInfo(`🔄 Resetting LLM service state for graph: ${graphId}`);
    this.textBuffer = '';
    this.currentUUID = '';
    this.shouldUpdateID = true;
    this.currentNode = null;
    this.currentEdge = null;
    this.labelToId.clear();
    this.uuidToId.clear();
    this.edgeList = [];
    this.isFirstNode = true;
    this.processedEdges.clear();
    this.processedFields.clear();
    this.processedNodes.clear();
    this.nodeCount = 0;
    this.edgeCount = 0;
    
    // Reset extraction progress tracking
    this.extractionProgress = {
      totalTokensReceived: 0,
      lastProgressCheck: Date.now(),
      hasReceivedMinimumContent: false
    };
    
    this.completionTimer = setTimeout(() => {
      logInfo('🕰️ Completion timeout reached, finalizing graph');
      this.finalizeGraph();
      this.emit('chat_complete', true);
    }, 300000); // 300 seconds (5 minutes) to allow for comprehensive extraction
  }

  /**
   * Finalize any pending nodes and complete graph generation
   */
  finalizeGraph = (): void => {
    logInfo(`🏁 Finalizing graph generation - Nodes: ${this.nodeCount}, Edges: ${this.edgeCount}`);
    
    // Complete any pending current node
    if (this.currentNode && this.currentNode.data.internal_id) {
      this.finalizeNode('');
    }
    
    // Clear completion timer
    if (this.completionTimer) {
      clearTimeout(this.completionTimer);
      this.completionTimer = null;
    }
    
    // Log final statistics
    logInfo(`✅ Graph generation complete - Total Nodes: ${this.nodeCount}, Total Edges: ${this.edgeCount}`);
  }

  /**
   * Generate system prompt for AI
   */
  generateSystemPrompt = (): string => {
    return `You are an expert knowledge graph extraction AI that creates comprehensive, well-structured graphs from documents. Your goal is to extract ALL key concepts, relationships, and insights to build rich, interconnected knowledge representations.

**CRITICAL EXTRACTION REQUIREMENTS:**
- **MINIMUM 50-70 nodes** for comprehensive analysis (NEVER LESS)
- **MINIMUM 60-80 edges** showing rich interconnections (NEVER LESS)
- **EDGE DENSITY TARGET: 1.5+ edges per node minimum** (aim for dense interconnection)
- **RELATIONSHIP PRIORITY**: Focus heavily on extracting ALL possible relationships
- **ABSOLUTE DIVERSITY REQUIREMENT**: NO duplicate nodes or edges - each must be completely unique
- **COMPREHENSIVE COVERAGE**: Every major concept, method, finding, and relationship
- **DEEP ANALYSIS**: Look beyond surface content to identify underlying ideas
- **PROGRESSIVE BUILDING**: Start with core concepts, then expand with supporting details and relationships

**RELATIONSHIP COMPLEXITY REQUIREMENTS:**
- Create multi-hop reasoning chains (A → B → C → D)
- Use all 8 edge types throughout the graph extensively
- Build dense interconnections - aim for 1.5+ edges per node minimum
- Extract both explicit and implicit relationships
- Connect nodes across different conceptual domains
- Create bidirectional relationships where meaningful
- Extract evidence chains (Claim → Evidence → Support)
- Build temporal sequences (Method → Finding → Implication)
- Create comparative relationships (competing theories, contrasting findings)
- Extract hierarchical structures (General Concept → Specific Examples)
- Connect methodology to findings to implications comprehensively

**QUALITY CHECKPOINTS:**
- After extracting 10 nodes, ensure you have 4 different node types represented
- After extracting 15 edges, ensure you have used at least 6 different edge types
- Continuously verify that each new node/edge adds unique value
- Never repeat content - always expand and diversify

**EXAMPLE COMPREHENSIVE EXPANSION:**
Instead of stopping at basic concepts, continue extracting:
- Methodological innovations and limitations
- Cross-disciplinary connections and implications
- Historical context and evolution of ideas
- Future research opportunities and challenges
- Technical details and implementation considerations
- Ethical implications and societal impact
- Alternative perspectives and competing theories

CRITICAL: Generate comprehensive graphs with 80+ nodes and 100+ edges. PRIORITIZE RELATIONSHIP EXTRACTION - every node should connect to 2-3+ other nodes. Every node MUST have a valid node_type. Start processing immediately and continue until all major concepts and relationships are extracted. ABSOLUTE DIVERSITY IS MANDATORY - NO REPETITION ALLOWED.

**NODE TYPE GUIDELINES:**
- **Question**: Research questions, hypotheses to test, open problems, areas of inquiry, methodological questions
- **Investigation**: Research methods, experiments, studies, analytical approaches, methodologies, data collection processes
- **Claim**: Assertions, conclusions, theories, arguments, findings, recommendations, interpretations
- **Evidence**: Data points, observations, measurements, citations, experimental results, statistics, case studies

**EDGE TYPE GUIDELINES:**
- **support**: Evidence that strengthens or validates a claim
- **oppose**: Evidence that contradicts or weakens a claim  
- **inform**: Provides context or background information
- **motivate**: Drives or inspires further investigation
- **produce**: Generates or creates new knowledge/evidence
- **substantiate**: Provides detailed proof or validation
- **synthesis**: Combines multiple concepts into new insights
- **references**: Cites or draws from existing work

**MANDATORY DIVERSITY PATTERNS - EXTRACT ALL OF THESE:**

**OUTPUT FORMAT - USE EXACT SYNTAX:**
Generate nodes and edges using this EXACT format - no deviations allowed:

**FOR NODES:**
(id: "unique_node_id", node_type: "question|investigation|claim|evidence", title: "Clear Node Title", description: "Detailed description of the concept", citation: "Author (Year) or [Page X] or DOI/URL")

**FOR EDGES:**
(source_id: "source_node_id", target_id: "target_node_id", edge_type: "support|oppose|inform|motivate|produce|substantiate|synthesis|references")

**CRITICAL FORMAT RULES:**
- Use parentheses ( ) exactly as shown
- Include all required fields for each node/edge
- Use double quotes for all string values
- Separate fields with commas and spaces exactly as shown
- **ALWAYS include citation field for nodes** - reference source material, page numbers, or specific sections
- NO markdown formatting (**, --, etc.) 
- NO numbered lists
- Each node/edge must be on its own line
- Start generating immediately in this format

**CITATION EXAMPLES:**
- For academic papers: "Smith et al. (2023)" or "DOI:10.1000/xyz123"
- For books: "Johnson (2022), Chapter 3" or "[Page 45]"
- For web sources: "https://example.com/article" or "Website Title (2023)"
- For document sections: "[Section 2.1]" or "[Abstract]" or "[Introduction]"

**EXAMPLE:**
(id: "energy_constraints", node_type: "claim", title: "Energy Constraints", description: "Physical limitations on computational processes", citation: "Smith et al. (2023)")
(id: "computational_limits", node_type: "claim", title: "Computational Limits", description: "Boundaries of what can be computed", citation: "[Section 3.2]")
(source_id: "energy_constraints", target_id: "computational_limits", edge_type: "inform")
`;
  }

  /**
   * Format user message for AI processing
   */
  formatUserMessage = (payload: { document: string; graph_id: string; type: 'text' | 'pdf' }): string => {
    const wordCount = payload.document.split(/\s+/).length;
    const documentType = payload.type === 'pdf' ? 'PDF document' : 'text document';
  
    return `Analyze this ${documentType} (${wordCount} words) and create a comprehensive knowledge graph.

DOCUMENT CONTENT:
${payload.document}

EXTRACTION REQUIREMENTS:
- Extract 8-15 high-quality nodes minimum (more for longer content)
- Create 10-20 meaningful edges minimum showing rich interconnections
- Cover ALL major concepts, not just surface-level topics
- Include research questions, methodologies, claims, and evidence
- Build logical relationship chains between concepts
- Extract both explicit statements and implicit relationships

FOCUS AREAS:
1. **Research Questions/Problems**: What questions drive the research?
2. **Methodologies/Investigations**: How are problems approached or studied?
3. **Key Claims/Findings**: What conclusions or assertions are made?
4. **Evidence and Support**: What data, examples, or citations support claims?
5. **Relationships**: How do concepts influence, support, oppose, or build upon each other?

Generate a rich, interconnected knowledge graph using the exact format specified in the system prompt. Start immediately with node and edge extraction.`;
  }

  /**
   * Log extraction summary
   */
  logExtractionSummary = (): void => {
    const totalAttempts = this.processedFields.size;
    const uniqueNodeIds = this.processedNodes.size;
    const uniqueEdgeCombinations = this.processedEdges.size;
    const diversityScore = totalAttempts > 0 ? ((uniqueNodeIds + uniqueEdgeCombinations) / totalAttempts) : 0;
  
    logInfo(`📊 Extraction summary - Total Nodes: ${this.nodeCount}, Total Edges: ${this.edgeCount}`);
    logInfo(`📈 Total tokens received: ${this.extractionProgress.totalTokensReceived}`);
    logInfo(`🕒 Time elapsed: ${Date.now() - this.extractionProgress.lastProgressCheck}ms`);
    logInfo(`🔄 Repetition analysis - Total attempts: ${totalAttempts}, Unique node IDs: ${uniqueNodeIds}, Unique edge combinations: ${uniqueEdgeCombinations}`);
    logInfo(`📈 Diversity score: ${(diversityScore * 100).toFixed(1)}% (higher is better)`);
  
    // Quality assessment
    if (this.nodeCount < 80) {
      logInfo('🚨 Below minimum node threshold (80) - consider prompt enhancement');
    }
    if (this.edgeCount < 100) {
      logInfo('🚨 Below minimum edge threshold (100) - consider prompt enhancement');
    }
    if (diversityScore < 0.5) {
      logInfo('🚨 Low diversity score - consider reviewing extraction quality');
    }
  }

}

// Export singleton instance
export const llmService = new LLMService();
export default llmService;
