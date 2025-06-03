import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const updateNode = async (node: FyloNode): Promise<FyloNode | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NODE_TABLE)
      .update({ ...node })
      .eq('id', node.id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
