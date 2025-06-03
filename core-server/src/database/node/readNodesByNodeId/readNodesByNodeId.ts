import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const readNodesByNodeId = async (id: string): Promise<FyloNode | undefined> => {
  try {
    const { data, error } = await supabaseClient.from(NODE_TABLE).select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
