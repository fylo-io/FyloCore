import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, GRAPH_TABLE, pool } from '../../postgresClient';

export const deleteNode = async (nodeId: string, graphId: string): Promise<void> => {
  try {
    // Start a transaction to ensure both operations succeed or fail together
    await pool.query('BEGIN');
    
    // Delete the node
    const deleteQuery = `DELETE FROM ${NODE_TABLE} WHERE id = $1 AND graph_id = $2`;
    const result = await pool.query(deleteQuery, [nodeId, graphId]);
    
    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      console.warn(`Node with id ${nodeId} not found for deletion in graph ${graphId}`);
      return;
    }
    
    // Update the graph's node count (decrement by 1, but ensure it doesn't go below 0)
    const updateGraphQuery = `
      UPDATE ${GRAPH_TABLE} 
      SET node_count = GREATEST(node_count - 1, 0) 
      WHERE id = $1
    `;
    await pool.query(updateGraphQuery, [graphId]);
    
    // Commit the transaction
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    handleErrors('PostgreSQL Error:', error as Error);
    throw error;
  }
};
