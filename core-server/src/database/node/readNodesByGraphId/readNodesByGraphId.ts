import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const readNodesByGraphId = async (graphId: string): Promise<FyloNode[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NODE_TABLE)
      .select('*')
      .eq('graph_id', graphId);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
