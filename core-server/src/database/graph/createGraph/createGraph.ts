import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, supabaseClient } from '../../supabaseClient';

export const createGraph = async (
  title: string,
  description: string,
  creatorId: string,
  creatorName: string,
  creatorProfileColor: string,
  sourceGraphId?: string,
): Promise<FyloGraph | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(GRAPH_TABLE)
      .insert([
        {
          title,
          description,
          creator_id: creatorId,
          source_graph_id: sourceGraphId,
          type: GraphType.PRIVATE,
          contributors: [{ name: creatorName, profile_color: creatorProfileColor }],
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
