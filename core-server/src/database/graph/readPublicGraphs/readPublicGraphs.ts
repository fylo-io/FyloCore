import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, supabaseClient } from '../../supabaseClient';

export const readPublicGraphs = async (): Promise<FyloGraph[] | undefined> => {
  try {
    const { data: graphs, error: fetchGraphsError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('*')
      .eq('type', GraphType.PUBLIC);

    if (fetchGraphsError) throw fetchGraphsError;
    return graphs;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
