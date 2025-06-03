import { Comment } from '../../../types/comment';
import { handleErrors } from '../../../utils/errorHandler';
import { COMMENT_TABLE, supabaseClient } from '../../supabaseClient';

export const createComment = async (
  graphId: string,
  author: string,
  color: string,
  nodeId: string,
  text: string,
): Promise<Comment | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(COMMENT_TABLE)
      .insert([
        {
          created_at: new Date(),
          graph_id: graphId,
          author: author,
          color: color,
          node_id: nodeId,
          text: text,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
