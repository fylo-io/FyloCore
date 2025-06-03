import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const createNode = async (node: FyloNode): Promise<FyloNode | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NODE_TABLE)
      .insert([{ ...node }])
      .select('*')
      .single();

    if (error) throw error;

    const graphId = node.graph_id;

    const { data: graphData, error: fetchError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('node_count')
      .eq('id', graphId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabaseClient
      .from(GRAPH_TABLE)
      .update({ node_count: (graphData.node_count || 0) + 1 })
      .eq('id', graphId);

    if (updateError) throw updateError;

    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
