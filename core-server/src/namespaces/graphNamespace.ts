import { Namespace, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { addCommentToEdge } from '../database/comment/addCommentToEdge/addCommentToEdge';
import { addCommentToNode } from '../database/comment/addCommentToNode/addCommentToNode';
import { createComment } from '../database/comment/createComment/createComment';
import { createEdge } from '../database/edge/createEdge/createEdge';
import { readEdgesByGraphId } from '../database/edge/readEdgesByGraphId/readEdgesByGraphId';
import { createNode } from '../database/node/createNode/createNode';
import { deleteNode } from '../database/node/deleteNode/deleteNode';
import { readNodesByGraphId } from '../database/node/readNodesByGraphId/readNodesByGraphId';
import { updateNode } from '../database/node/updateNode/updateNode';
import { updateNodeData } from '../database/node/updateNodeData/updateNodeData';
import { FyloEdge, FyloNode } from '../types/graph';
import { handleErrors } from '../utils/errorHandler';
import { logInfo } from '../utils/logger';
import llmService from '../services/llmService';

/**
 * @swagger
 * tags:
 *   name: Graph WebSocket
 *   description: WebSocket events for real-time graph manipulation
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GraphUpdateAction:
 *       type: string
 *       enum:
 *         - ADD_NODE
 *         - MOVE_NODE
 *         - STOP_NODE
 *         - ADD_EDGE
 *         - UPDATE_NODE
 *         - DELETE_NODE
 *         - LOCK_NODE
 *         - UNLOCK_NODE
 *       description: Type of graph update action
 *
 *     CursorPosition:
 *       type: object
 *       required:
 *         - graphId
 *         - userId
 *         - x
 *         - y
 *         - color
 *         - name
 *       properties:
 *         graphId:
 *           type: string
 *           description: ID of the graph where the cursor is moving
 *         userId:
 *           type: string
 *           description: ID of the user moving the cursor
 *         x:
 *           type: number
 *           description: X coordinate of the cursor
 *         y:
 *           type: number
 *           description: Y coordinate of the cursor
 *         color:
 *           type: string
 *           description: Color of the cursor
 *         name:
 *           type: string
 *           description: Name of the user moving the cursor
 *
 *     ChatMessage:
 *       type: object
 *       required:
 *         - graphId
 *         - message
 *       properties:
 *         graphId:
 *           type: string
 *           description: ID of the graph to send the message to
 *         message:
 *           type: string
 *           description: Text message to be processed
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional array of reference IDs
 */

/**
 * Handles the graph namespace for Socket.IO
 * @param graphNamespace - Socket.IO namespace for graph operations
 *
 * @swagger
 * /graph:
 *   get:
 *     tags: [Graph WebSocket]
 *     summary: WebSocket endpoint for graph operations
 *     description: |
 *       This is a Socket.IO namespace endpoint for real-time graph operations.
 *       Connect to this endpoint using Socket.IO client to interact with graphs in real-time.
 *
 *       **Events emitted by client:**
 *       - `join_graph`: Join a specific graph room
 *       - `leave_graph`: Leave a specific graph room
 *       - `update_graph`: Update a graph with various actions
 *       - `user_cursor_move`: Update cursor position
 *       - `add_node_edge`: Add a node and edge simultaneously
 *       - `ADD_COMMENT`: Add a comment to a node or edge
 *       - `chat`: Send a chat message for processing
 *
 *       **Events emitted by server:**
 *       - `current_graph`: Current state of nodes and edges in a graph
 *       - `add_node`: Notification that a node was added
 *       - `move_node`: Notification that a node was moved
 *       - `stop_node`: Notification that a node stopped moving
 *       - `add_edge`: Notification that an edge was added
 *       - `update_node`: Notification that a node was updated
 *       - `delete_node`: Notification that a node was deleted
 *       - `lock_node`: Notification that a node was locked
 *       - `unlock_node`: Notification that a node was unlocked
 *       - `update_remote_cursor`: Update of another user's cursor position
 *       - `add_comment`: Notification that a comment was added
 *       - `update_edge`: Notification that an edge was updated
 *       - `chat_complete`: Notification that chat processing is complete
 *       - `update_stream`: Update stream for real-time node/edge creation
 *       - `error`: Error notification
 */
export const handleGraphNamespace = (graphNamespace: Namespace): void => {
  // Store the graphs the socket is connected to
  graphNamespace.on('connection', (socket: Socket) => {
    const graphRooms = new Set<string>();

    /**
     * @swagger
     * /graph#join_graph:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Join a graph room
     *     description: |
     *       Socket event to join a specific graph room and receive current nodes and edges.
     *
     *       **Event name:** `join_graph`
     *
     *       **Response events:**
     *       - `current_graph`: Current state of nodes and edges in the graph
     *       - `error`: Error message if something went wrong
     *     parameters:
     *       - name: graphId
     *         description: ID of the graph to join
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on('join_graph', async (graphId: string) => {
      try {
        if (!graphId) {
          socket.emit('error', 'Invalid graphId');
          return;
        }

        socket.join(graphId);
        graphRooms.add(graphId);

        // Validate if graph exists or handle accordingly
        const nodes = await readNodesByGraphId(graphId);
        const edges = await readEdgesByGraphId(graphId);

        if (nodes && edges) {
          socket.emit('current_graph', nodes, edges);
        } else {
          socket.emit('error', 'Unable to fetch nodes and edges');
        }
      } catch (error) {
        handleErrors('Error joining graph:', error as Error);
      }
    });

    /**
     * @swagger
     * /graph#leave_graph:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Leave a graph room
     *     description: |
     *       Socket event to leave a specific graph room.
     *
     *       **Event name:** `leave_graph`
     *
     *       **Response events:**
     *       - `error`: Error message if something went wrong
     *     parameters:
     *       - name: graphId
     *         description: ID of the graph to leave
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on('leave_graph', (graphId: string) => {
      try {
        if (!graphId) {
          socket.emit('error', 'Invalid graphId');
          return;
        }

        socket.leave(graphId);
        graphRooms.delete(graphId);
      } catch (error) {
        handleErrors('Error leaving graph:', error as Error);
      }
    });

    /**
     * @swagger
     * /graph#update_graph:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Update a graph with various actions
     *     description: |
     *       Socket event to update a graph with different actions like adding nodes, moving nodes, etc.
     *
     *       **Event name:** `update_graph`
     *
     *       **Response events:**
     *       - Action-specific events like `add_node`, `move_node`, etc.
     *       - `error`: Error message if something went wrong
     *     parameters:
     *       - name: action
     *         description: Type of update action
     *         required: true
     *         schema:
     *           $ref: '#/components/schemas/GraphUpdateAction'
     *       - name: data
     *         description: Data for the update action
     *         required: true
     *         schema:
     *           type: object
     *       - name: graphId
     *         description: ID of the graph to update
     *         required: true
     *         schema:
     *           type: string
     */
    // eslint-disable-next-line
    socket.on('update_graph', async (action: string, data: any, graphId: string) => {
      try {
        if (!action || !graphId) {
          socket.emit('error', 'Invalid action or graphId');
          return;
        }

        if (!graphRooms.has(graphId)) {
          socket.emit('error', 'You are not part of this graph');
          return;
        }

        switch (action) {
          case 'ADD_NODE': {
            const createdNode = await createNode(data);
            graphNamespace.to(graphId).emit('add_node', createdNode);
            break;
          }
          case 'MOVE_NODE': {
            graphNamespace.to(graphId).emit('move_node', data);
            break;
          }
          case 'STOP_NODE': {
            await updateNode({
              ...data,
              selected: false,
              dragging: false,
              data: { ...data.data, is_moving: false, picker_color: '' },
            });
            graphNamespace.to(graphId).emit('stop_node', data);
            break;
          }
          case 'ADD_EDGE': {
            const createdEdge = await createEdge(data);
            graphNamespace.to(graphId).emit('add_edge', createdEdge);
            break;
          }
          case 'UPDATE_NODE': {
            await updateNode(data);
            graphNamespace.to(graphId).emit('update_node', data);
            break;
          }
          case 'DELETE_NODE': {
            await deleteNode(data);
            graphNamespace.to(graphId).emit('delete_node', data);
            break;
          }
          case 'LOCK_NODE': {
            graphNamespace.to(graphId).emit('lock_node', data);
            break;
          }
          case 'UNLOCK_NODE': {
            graphNamespace.to(graphId).emit('unlock_node', data);
            break;
          }
          default:
            socket.emit('error', 'Unknown action');
        }
      } catch (error) {
        handleErrors('Error broadcasting action:', error as Error);
      }
    });

    /**
     * @swagger
     * /graph#user_cursor_move:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Update cursor position
     *     description: |
     *       Socket event to update and broadcast a user's cursor position in a graph.
     *
     *       **Event name:** `user_cursor_move`
     *
     *       **Response events:**
     *       - `update_remote_cursor`: Notification about cursor position update
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CursorPosition'
     */
    socket.on('user_cursor_move', (data) => {
      const { graphId, userId, x, y, color, name } = data;
      graphNamespace.to(graphId).emit('update_remote_cursor', {
        userId,
        x,
        y,
        color,
        name,
        graphId,
      });
    });

    /**
     * @swagger
     * /graph#add_node_edge:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Add a node and edge simultaneously
     *     description: |
     *       Socket event to add a node and an edge in a single operation.
     *
     *       **Event name:** `add_node_edge`
     *
     *       **Response events:**
     *       - `add_node_edge`: Notification that a node and edge were added
     *     parameters:
     *       - name: nodeData
     *         description: Data for the node to create
     *         required: true
     *         schema:
     *           $ref: '#/components/schemas/FyloNode'
     *       - name: edgeData
     *         description: Data for the edge to create
     *         required: true
     *         schema:
     *           $ref: '#/components/schemas/FyloEdge'
     *       - name: graphId
     *         description: ID of the graph to update
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on('add_node_edge', async (nodeData: FyloNode, edgeData: FyloEdge, graphId: string) => {
      try {
        const createdNode = await createNode(nodeData);
        const createdEdge = await createEdge(edgeData);
        graphNamespace.to(graphId).emit('add_node_edge', createdNode, createdEdge);
      } catch (error) {
        handleErrors('Error adding node and edge:', error as Error);
      }
    });

    /**
     * @swagger
     * /graph#ADD_COMMENT:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Add a comment to a node or edge
     *     description: |
     *       Socket event to add a comment to a node or edge in a graph.
     *
     *       **Event name:** `ADD_COMMENT`
     *
     *       **Response events:**
     *       - `add_comment`: Notification that a comment was added
     *       - `update_node` or `update_edge`: Notification that the node or edge was updated
     *     parameters:
     *       - name: graphId
     *         description: ID of the graph
     *         required: true
     *         schema:
     *           type: string
     *       - name: userName
     *         description: Name of the user adding the comment
     *         required: true
     *         schema:
     *           type: string
     *       - name: color
     *         description: Color associated with the user
     *         required: true
     *         schema:
     *           type: string
     *       - name: nodeId
     *         description: ID of the node or edge (prefixed with - for edges)
     *         required: true
     *         schema:
     *           type: string
     *       - name: text
     *         description: Content of the comment
     *         required: true
     *         schema:
     *           type: string
     */
    socket.on(
      'ADD_COMMENT',
      async (graphId: string, userName: string, color: string, nodeId: string, text: string) => {
        try {
          const commentType = nodeId.startsWith('-') ? 'edge' : 'node';
          const realId = nodeId.startsWith('-') ? nodeId.slice(1) : nodeId;

          const comment = await createComment(graphId, userName, color, realId, text);
          graphNamespace.emit('add_comment', comment);
          graphNamespace.to(graphId).emit('add_comment', comment);

          if (comment) {
            if (commentType === 'node') {
              const updatedNode = await addCommentToNode(comment);
              graphNamespace.emit('update_node', updatedNode);
              graphNamespace.to(graphId).emit('update_node', updatedNode);
            } else {
              const updatedEdge = await addCommentToEdge(comment);
              graphNamespace.emit('update_edge', updatedEdge);
              graphNamespace.to(graphId).emit('update_edge', updatedEdge);
            }
          }
        } catch (error) {
          handleErrors('Error adding comment:', error as Error);
        }
      },
    );

    /**
     * @swagger
     * /graph#chat:
     *   post:
     *     tags: [Graph WebSocket]
     *     summary: Process a chat message
     *     description: |
     *       Socket event to process a chat message and stream the response.
     *       This generates nodes and edges based on the content of the message.
     *
     *       **Event name:** `chat`
     *
     *       **Response events:**
     *       - `add_node`: Notification of node creation
     *       - `add_edge`: Notification of edge creation
     *       - `update_stream`: Updates during streaming process
     *       - `chat_complete`: Notification that processing is complete
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ChatMessage'
     */
    socket.on(
      'chat',
      async (graphId: string, message: string) => {
        try {
          if (message) {
            logInfo(message);
            
            // Set up event handlers for this chat session
            const handleAddNode = async (node: any) => {
              try {
                const createdNode = await createNode(node);
                if (createdNode) {
                  socket.emit('add_node', createdNode);
                  socket.to(graphId).emit('add_node', createdNode);
                }
              } catch (error) {
                handleErrors('Error creating node:', error as Error);
              }
            };

            const handleAddEdge = async (edge: any) => {
              try {
                const createdEdge = await createEdge(edge);
                if (createdEdge) {
                  socket.emit('add_edge', createdEdge);
                  socket.to(graphId).emit('add_edge', createdEdge);
                }
              } catch (error) {
                handleErrors('Error creating edge:', error as Error);
              }
            };

            const handleUpdateStream = (uuid: string, key: string, value: string) => {
              socket.emit('update_stream', uuid, key, value);
              socket.to(graphId).emit('update_stream', uuid, key, value);
            };

            const handleChatComplete = () => {
              socket.emit('chat_complete');
              socket.to(graphId).emit('chat_complete');
              
              // Clean up event listeners
              llmService.removeListener('add_node', handleAddNode);
              llmService.removeListener('add_edge', handleAddEdge);
              llmService.removeListener('update_stream', handleUpdateStream);
              llmService.removeListener('chat_complete', handleChatComplete);
            };

            // Register event listeners
            llmService.on('add_node', handleAddNode);
            llmService.on('add_edge', handleAddEdge);
            llmService.on('update_stream', handleUpdateStream);
            llmService.on('chat_complete', handleChatComplete);

            // Start AI processing
            await llmService.sendMessage('chat', {
              document: message,
              graph_id: graphId,
              type: 'text',
            });
          }
        } catch (error) {
          handleErrors('Error in chat event handler:', error as Error);
        }
      },
    );

    /**
     * Handle socket disconnection
     */
    socket.on('disconnect', () => {
      graphRooms.forEach((graphId) => socket.leave(graphId));
    });
  });
};
