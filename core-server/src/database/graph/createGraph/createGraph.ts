import { FyloGraph } from '../../../types/graph';
import { GRAPH_TABLE, pool } from '../../postgresClient';
import crypto from 'crypto';

export const createGraph = async (graphData: Omit<FyloGraph, 'id' | 'created_at'>): Promise<FyloGraph | null> => {
  try {
    // Generate UUID for the graph ID
    const graphId = crypto.randomUUID();
    
    const query = `
      INSERT INTO ${GRAPH_TABLE} (id, title, description, creator_id, type, source_graph_id, node_count, contributors, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      graphId,
      graphData.title,
      graphData.description,
      graphData.creator_id,
      graphData.type,
      graphData.source_graph_id || null,
      graphData.node_count,
      graphData.contributors ? JSON.stringify(graphData.contributors) : null,
      new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse JSON fields back to objects
    const returnedGraph = result.rows[0];
    if (typeof returnedGraph.contributors === 'string') {
      returnedGraph.contributors = JSON.parse(returnedGraph.contributors);
    }
    
    return returnedGraph as FyloGraph;
  } catch (error) {
    console.error('Error creating graph:', error);
    throw error;
  }
};
