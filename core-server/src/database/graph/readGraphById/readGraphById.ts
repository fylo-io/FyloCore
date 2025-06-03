import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, supabaseClient } from '../../supabaseClient';

export const readGraphById = async (graphId: string): Promise<FyloGraph | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('*')
      .eq('id', graphId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
