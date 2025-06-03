import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const deleteEdge = async (edge: FyloEdge): Promise<void> => {
  try {
    const { error } = await supabaseClient.from(EDGE_TABLE).delete().eq('id', edge.id);

    if (error) throw error;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
