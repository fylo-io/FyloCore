import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const readEdgesByNodeId = async (nodeId: string): Promise<FyloEdge[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(EDGE_TABLE)
      .select('*')
      .or(`source.eq.${nodeId},target.eq.${nodeId}`);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
