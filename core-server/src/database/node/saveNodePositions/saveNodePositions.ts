import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

export const saveNodePositions = async (nodes: FyloNode[]): Promise<void> => {
  try {
    for (const node of nodes) {
      const { error } = await supabaseClient
        .from(NODE_TABLE)
        .update({ position: node.position })
        .eq('id', node.id);

      if (error) throw error;
    }
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
