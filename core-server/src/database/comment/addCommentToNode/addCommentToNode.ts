import { Comment } from '../../../types/comment';
import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const addCommentToNode = async (comment: Comment): Promise<FyloNode | undefined> => {
  try {
    const { data: currentNode, error: fetchError } = await supabaseClient
      .from(NODE_TABLE)
      .select('*')
      .eq('id', comment.node_id)
      .single();

    if (fetchError) throw fetchError;

    const newComments: Comment[] = currentNode.data.comments
      ? [...currentNode.data.comments, comment]
      : [comment];

    const newData = { ...currentNode.data, comments: newComments };

    const { data: updatedNode, error: updateError } = await supabaseClient
      .from(NODE_TABLE)
      .update({ data: newData })
      .eq('id', comment.node_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedNode;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
