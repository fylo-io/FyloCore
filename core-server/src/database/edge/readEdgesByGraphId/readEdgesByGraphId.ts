import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const readEdgesByGraphId = async (graphId: string): Promise<FyloEdge[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(EDGE_TABLE)
      .select('*')
      .eq('graph_id', graphId);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
