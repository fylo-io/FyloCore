import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const updateNodeData = async (
  nodeId: string,
  graphId: string,
  newData: Partial<FyloNode['data']>,
  // eslint-disable-next-line
) => {
  try {
    const { data: existingNode, error: fetchError } = await supabaseClient
      .from(NODE_TABLE)
      .select('*')
      .filter('id', 'eq', nodeId)
      .filter('graph_id', 'eq', graphId)
      .single();

    if (fetchError) {
      handleErrors('Error fetching node data:', fetchError);
      throw fetchError;
    }

    if (!existingNode) {
      console.warn(`Node with id: ${nodeId} and graphId: ${graphId} not found.`);
      return;
    }

    const updatedData = { ...existingNode.data, ...newData };

    const { data, error } = await supabaseClient
      .from(NODE_TABLE)
      .update({ data: updatedData })
      .eq('id', nodeId)
      .eq('graph_id', graphId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
