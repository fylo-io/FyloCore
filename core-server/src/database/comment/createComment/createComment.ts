import { Comment } from '../../../types/comment';
import { COMMENT_TABLE, pool } from '../../postgresClient';
import crypto from 'crypto';

export const createComment = async (
  graphId: string,
  userName: string,
  color: string,
  nodeId: string,
  text: string,
): Promise<Comment | null> => {
  try {
    const query = `
      INSERT INTO ${COMMENT_TABLE} (id, graph_id, author, color, node_id, text, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      crypto.randomUUID(),
      graphId,
      userName,
      color,
      nodeId,
      text,
      new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};
