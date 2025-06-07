import { FyloNode } from '../../../types/graph';
import { NODE_TABLE, GRAPH_TABLE, pool } from '../../postgresClient';

export const createNode = async (node: FyloNode): Promise<FyloNode | null> => {
  try {
    // Start a transaction to ensure both operations succeed or fail together
    await pool.query('BEGIN');
    
    // Create the node
    const nodeQuery = `
      INSERT INTO ${NODE_TABLE} (id, graph_id, type, position, data, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const nodeValues = [
      node.id,
      node.graph_id,
      node.type,
      JSON.stringify(node.position),
      JSON.stringify(node.data),
      node.created_at || new Date().toISOString()
    ];
    
    const nodeResult = await pool.query(nodeQuery, nodeValues);
    
    if (nodeResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return null;
    }
    
    // Update the graph's node count
    const updateGraphQuery = `
      UPDATE ${GRAPH_TABLE} 
      SET node_count = node_count + 1 
      WHERE id = $1
    `;
    await pool.query(updateGraphQuery, [node.graph_id]);
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    // Parse JSON fields back to objects
    const returnedNode = nodeResult.rows[0];
    if (typeof returnedNode.position === 'string') {
      returnedNode.position = JSON.parse(returnedNode.position);
    }
    if (typeof returnedNode.data === 'string') {
      returnedNode.data = JSON.parse(returnedNode.data);
    }
    
    return returnedNode as FyloNode;
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating node:', error);
    throw error;
  }
};
