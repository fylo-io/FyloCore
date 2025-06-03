import { Comment } from '../../../types/comment';
import { handleErrors } from '../../../utils/errorHandler';
import { COMMENT_TABLE, supabaseClient } from '../../supabaseClient';

export const readCommentsByGraphId = async (graphId: string): Promise<Comment[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(COMMENT_TABLE)
      .select('*')
      .eq('graph_id', graphId);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
