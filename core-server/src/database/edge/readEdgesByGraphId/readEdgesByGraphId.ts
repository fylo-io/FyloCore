import { FyloEdge } from '../../../types/graph';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const readEdgesByGraphId = async (graphId: string): Promise<FyloEdge[]> => {
  try {
    const query = `SELECT * FROM ${EDGE_TABLE} WHERE graph_id = $1`;
    const result = await pool.query(query, [graphId]);
      
    return result.rows as FyloEdge[];
  } catch (error) {
    console.error('Error reading edges by graph ID:', error);
    throw error;
  }
};
