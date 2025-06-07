import { handleErrors } from '../../../utils/errorHandler';
import { SHARE_TABLE, pool } from '../../postgresClient';

export const readSharedUserIds = async (graphId: string): Promise<string[]> => {
  try {
    const query = `SELECT user_id FROM ${SHARE_TABLE} WHERE graph_id = $1`;
    const result = await pool.query(query, [graphId]);
    
    return result.rows ? result.rows.map((row: any) => row.user_id) : [];
  } catch (error) {
    console.error('Error reading shared user IDs:', error);
    throw error;
  }
};
