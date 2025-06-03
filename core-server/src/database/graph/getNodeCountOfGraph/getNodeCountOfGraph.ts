import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const getNodeCountOfGraph = async (graphId: string): Promise<number | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NODE_TABLE)
      .select('*')
      .eq('graph_id', graphId);

    if (error) throw error;
    return data.length;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
