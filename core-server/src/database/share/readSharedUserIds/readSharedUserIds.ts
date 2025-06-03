import { handleErrors } from '../../../utils/errorHandler';
import { SHARE_TABLE, supabaseClient } from '../../supabaseClient';

export const readSharedUserIds = async (graphId: string): Promise<string[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(SHARE_TABLE)
      .select('user_id')
      .eq('graph_id', graphId);

    if (error) throw error;
    return data.map((value) => value.user_id);
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
