import { Comment } from '../../../types/comment';
import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const addCommentToEdge = async (comment: Comment): Promise<FyloEdge | undefined> => {
  try {
    const { data: currentEdge, error: fetchError } = await supabaseClient
      .from(EDGE_TABLE)
      .select('*')
      .eq('id', comment.node_id)
      .single();

    if (fetchError) throw fetchError;

    const newComments: Comment[] = currentEdge.data.comments
      ? [...currentEdge.data.comments, comment]
      : [comment];

    const newData = { ...currentEdge.data, comments: newComments };

    const { data: updatedEdge, error: updateError } = await supabaseClient
      .from(EDGE_TABLE)
      .update({ data: newData })
      .eq('id', comment.node_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedEdge;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
