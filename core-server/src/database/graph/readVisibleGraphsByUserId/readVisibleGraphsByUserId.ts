import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, SHARE_TABLE, supabaseClient } from '../../supabaseClient';

export const readVisibleGraphsByUserId = async (
  userId: string,
): Promise<FyloGraph[] | undefined> => {
  try {
    // Get graphs created by the user
    const { data: createdGraphs, error: createdGraphsError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('*')
      .eq('creator_id', userId);

    if (createdGraphsError) throw createdGraphsError;

    // Get shared graph IDs for the user
    const { data: sharedGraphIds, error: sharedGraphIdsError } = await supabaseClient
      .from(SHARE_TABLE)
      .select('graph_id')
      .eq('user_id', userId);

    if (sharedGraphIdsError) throw sharedGraphIdsError;

    const graphIds: string[] = sharedGraphIds.map((share) => share.graph_id);

    // Get shared graphs based on the graph IDs
    const { data: sharedGraphs, error: sharedGraphsError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('*')
      .in('id', graphIds);

    if (sharedGraphsError) throw sharedGraphsError;

    return [...createdGraphs, ...sharedGraphs];
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
