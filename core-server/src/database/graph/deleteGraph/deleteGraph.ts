import { EDGE_TABLE, GRAPH_TABLE, NODE_TABLE, pool } from '../../postgresClient';

export const deleteGraph = async (graphId: string): Promise<void> => {
  try {
    // Delete associated edges first
    await pool.query(`DELETE FROM ${EDGE_TABLE} WHERE graph_id = $1`, [graphId]);

    // Delete associated nodes
    await pool.query(`DELETE FROM ${NODE_TABLE} WHERE graph_id = $1`, [graphId]);

    // Delete the graph
    await pool.query(`DELETE FROM ${GRAPH_TABLE} WHERE id = $1`, [graphId]);
  } catch (error) {
    console.error('Error deleting graph:', error);
    throw error;
  }
};
