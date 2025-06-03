import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const deleteNode = async (nodeId: string): Promise<void> => {
  try {
    const { data: nodeData, error: fetchError } = await supabaseClient
      .from(NODE_TABLE)
      .select('graph_id')
      .eq('id', nodeId)
      .single();

    if (fetchError) throw fetchError;

    if (!nodeData || !nodeData.graph_id) {
      throw new Error('Node not found or missing graph_id');
    }

    const { error: deleteError } = await supabaseClient.from(NODE_TABLE).delete().eq('id', nodeId);

    if (deleteError) throw deleteError;

    const { data: graphData, error: graphFetchError } = await supabaseClient
      .from(GRAPH_TABLE)
      .select('node_count')
      .eq('id', nodeData.graph_id)
      .single();

    if (graphFetchError) throw graphFetchError;

    const newNodeCount = Math.max((graphData?.node_count || 1) - 1, 0);

    const { error: updateError } = await supabaseClient
      .from(GRAPH_TABLE)
      .update({ node_count: newNodeCount })
      .eq('id', nodeData.graph_id);

    if (updateError) throw updateError;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
