import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, SHARE_TABLE, supabaseClient } from '../../supabaseClient';

export const createShare = async (graphId: string, user: User): Promise<void> => {
  try {
    const { error } = await supabaseClient.from(SHARE_TABLE).insert([
      {
        graph_id: graphId,
        user_id: user.id,
      },
    ]);

    if (error) throw error;

    const { data: graphData, error: graphError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('contributors')
      .eq('id', graphId)
      .single();

    if (graphError) throw graphError;

    const newContributor = {
      name: user.name || user.name,
      profile_color: user.profile_color,
    };

    const currentContributors = graphData?.contributors || [];

    const contributorExists = currentContributors.some(
      (contributor: { name: string }) => contributor.name === newContributor.name,
    );

    if (!contributorExists) {
      const updatedContributors = [...currentContributors, newContributor];

      const { error: updateError } = await supabaseClient
        .from(GRAPH_TABLE)
        .update({ contributors: updatedContributors })
        .eq('id', graphId);

      if (updateError) throw updateError;
    }
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
