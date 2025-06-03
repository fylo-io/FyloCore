import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const deleteGraph = async (graphId: string): Promise<void> => {
  try {
    // Delete the graph
    const { error: deleteGraphError } = await supabaseClient
      .from(GRAPH_TABLE)
      .delete()
      .eq('id', graphId);

    if (deleteGraphError) throw deleteGraphError;

    // Delete associated nodes
    const { error: deleteNodesError } = await supabaseClient
      .from(NODE_TABLE)
      .delete()
      .eq('graph_id', graphId);

    if (deleteNodesError) throw deleteNodesError;

    // Delete associated edges
    const { error: deleteEdgesError } = await supabaseClient
      .from(EDGE_TABLE)
      .delete()
      .eq('graph_id', graphId);

    if (deleteEdgesError) throw deleteEdgesError;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
