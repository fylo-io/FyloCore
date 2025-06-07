import { FyloGraph } from '../../../types/graph';
import { GRAPH_TABLE, SHARE_TABLE, pool } from '../../postgresClient';

export const readVisibleGraphsByUserId = async (userId: string): Promise<FyloGraph[]> => {
  try {
    // Query for graphs owned by user OR shared with user
    const query = `
      SELECT DISTINCT g.* FROM ${GRAPH_TABLE} g
      LEFT JOIN ${SHARE_TABLE} s ON g.id = s.graph_id
      WHERE g.creator_id = $1 OR s.user_id = $1
      ORDER BY g.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    
    return result.rows || [];
  } catch (error) {
    console.error('Error reading visible graphs by user ID:', error);
    throw error;
  }
};
