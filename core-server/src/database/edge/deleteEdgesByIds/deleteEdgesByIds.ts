import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const deleteEdgesByIds = async (edgeIds: string[]): Promise<void> => {
  try {
    if (edgeIds.length === 0) return;

    const { error } = await supabaseClient.from(EDGE_TABLE).delete().in('id', edgeIds);

    if (error) throw error;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
