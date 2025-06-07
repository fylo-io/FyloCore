import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, pool } from '../../postgresClient';

export const getNodeCountOfGraph = async (graphId: string): Promise<number> => {
  try {
    const query = `SELECT COUNT(*) as count FROM ${NODE_TABLE} WHERE graph_id = $1`;
    const result = await pool.query(query, [graphId]);
    
    return parseInt(result.rows[0].count, 10) || 0;
  } catch (error) {
    console.error('Error getting node count:', error);
    handleErrors('PostgreSQL Error:', error as Error);
    return 0;
  }
};
