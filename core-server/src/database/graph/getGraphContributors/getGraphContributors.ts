import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { SHARE_TABLE, USER_TABLE, supabaseClient } from '../../supabaseClient';

export const getGraphContributors = async (
  graph: FyloGraph,
): Promise<
  { id: string; name: string; profile_color: string; avatar_url: string }[] | undefined
> => {
  try {
    const { data, error } = await supabaseClient
      .from(SHARE_TABLE)
      .select('user_id')
      .eq('graph_id', graph.id);

    if (error) throw error;

    const { data: ownerData, error: ownerFetchError } = await supabaseClient
      .from(USER_TABLE)
      .select('id, name, profile_color, avatar_url')
      .eq('id', graph.creator_id);

    const { data: viewerData, error: viewerFetchError } = await supabaseClient
      .from(USER_TABLE)
      .select('id, name, profile_color, avatar_url')
      .in(
        'id',
        data.map((item: { user_id: string }) => item.user_id),
      );

    if (ownerFetchError || viewerFetchError) throw error;

    return [...ownerData, ...viewerData];
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
