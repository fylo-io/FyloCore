import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const updateEdge = async (edge: FyloEdge): Promise<FyloEdge | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(EDGE_TABLE)
      .update({ ...edge })
      .eq('id', edge.id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
