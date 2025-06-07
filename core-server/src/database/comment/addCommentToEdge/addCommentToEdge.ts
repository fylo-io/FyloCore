import { FyloEdge } from '../../../types/graph';
import { Comment } from '../../../types/comment';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const addCommentToEdge = async (
  edgeId: string,
  comment: Comment,
): Promise<FyloEdge | null> => {
  try {
    // First get the current edge to access existing comments
    const getQuery = `SELECT * FROM ${EDGE_TABLE} WHERE id = $1`;
    const getResult = await pool.query(getQuery, [edgeId]);
    
    if (!getResult.rows || getResult.rows.length === 0) {
      return null;
    }
    
    const edge = getResult.rows[0];
    const currentComments = edge.data?.comments || [];
    const updatedComments = [...currentComments, comment];
    
    // Update the edge with the new comment
    const updateQuery = `UPDATE ${EDGE_TABLE} SET data = jsonb_set(data, '{comments}', $1::jsonb) WHERE id = $2 RETURNING *`;
    const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedComments), edgeId]);
    
    return updateResult.rows && updateResult.rows.length > 0 ? updateResult.rows[0] : null;
  } catch (error) {
    console.error('Error adding comment to edge:', error);
    throw error;
  }
};
