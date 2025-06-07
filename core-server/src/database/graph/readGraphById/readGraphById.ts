import { FyloGraph } from '../../../types/graph';
import { GRAPH_TABLE, pool } from '../../postgresClient';

export const readGraphById = async (graphId: string): Promise<FyloGraph | null> => {
  try {
    const query = `SELECT * FROM ${GRAPH_TABLE} WHERE id = $1 LIMIT 1`;
    const result = await pool.query(query, [graphId]);
      
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as FyloGraph;
  } catch (error) {
    console.error('Error reading graph by ID:', { data: null, error });
    throw error;
  }
};
