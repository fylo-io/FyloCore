import { Comment } from '../../../types/comment';
import { FyloNode } from '../../../types/graph';
import { NODE_TABLE, pool } from '../../postgresClient';

export const addCommentToNode = async (nodeId: string, comment: Comment): Promise<FyloNode | null> => {
  try {
    // First get the current node to access existing comments
    const getQuery = `SELECT * FROM ${NODE_TABLE} WHERE id = $1`;
    const getResult = await pool.query(getQuery, [nodeId]);
    
    if (!getResult.rows || getResult.rows.length === 0) {
      return null;
    }
    
    const node = getResult.rows[0];
    const currentComments = node.data?.comments || [];
    const updatedComments = [...currentComments, comment];
    
    // Update the node with the new comment
    const updateQuery = `UPDATE ${NODE_TABLE} SET data = jsonb_set(data, '{comments}', $1::jsonb) WHERE id = $2 RETURNING *`;
    const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedComments), nodeId]);
    
    return updateResult.rows && updateResult.rows.length > 0 ? updateResult.rows[0] : null;
  } catch (error) {
    console.error('Error adding comment to node:', error);
    throw error;
  }
};
