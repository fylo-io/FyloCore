import { FyloGraph } from '../../../types/graph';
import { SHARE_TABLE, USER_TABLE, pool } from '../../postgresClient';
import { handleErrors } from '../../../utils/errorHandler';

export const getGraphContributors = async (
  graph: FyloGraph,
): Promise<
  { id: string; name: string; profile_color: string; avatar_url: string }[] | undefined
> => {
  try {
    // Get user IDs from share table
    const shareQuery = `SELECT user_id FROM ${SHARE_TABLE} WHERE graph_id = $1`;
    const shareResult = await pool.query(shareQuery, [graph.id]);
    
    // Get owner data
    const ownerQuery = `SELECT id, name, profile_color, avatar_url FROM ${USER_TABLE} WHERE id = $1`;
    const ownerResult = await pool.query(ownerQuery, [graph.creator_id]);
    
    // Get viewer data if there are any viewers
    let viewerResult = { rows: [] };
    if (shareResult.rows.length > 0) {
      const userIds = shareResult.rows.map((row: { user_id: string }) => row.user_id);
      const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
      const viewerQuery = `SELECT id, name, profile_color, avatar_url FROM ${USER_TABLE} WHERE id IN (${placeholders})`;
      viewerResult = await pool.query(viewerQuery, userIds);
    }

    return [...ownerResult.rows, ...viewerResult.rows];
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
