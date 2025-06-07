import { Comment } from '../../../types/comment';
import { COMMENT_TABLE, pool } from '../../postgresClient';

export const readCommentsByGraphId = async (graphId: string): Promise<Comment[]> => {
  try {
    const query = `
      SELECT * FROM ${COMMENT_TABLE}
      WHERE graph_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [graphId]);
    
    return result.rows as Comment[];
  } catch (error) {
    console.error('Error reading comments by graph ID:', error);
    throw error;
  }
};
