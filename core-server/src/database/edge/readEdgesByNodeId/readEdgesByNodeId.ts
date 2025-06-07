import { FyloEdge } from '../../../types/graph';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const readEdgesByNodeId = async (nodeId: string): Promise<FyloEdge[]> => {
  try {
    // Use raw SQL for OR condition since PostgreSQL client doesn't have .or() method
    const query = `SELECT * FROM ${EDGE_TABLE} WHERE source = $1 OR target = $1`;
    const result = await pool.query(query, [nodeId]);
    
    return result.rows || [];
  } catch (error) {
    console.error('Error reading edges by node ID:', error);
    throw error;
  }
};
