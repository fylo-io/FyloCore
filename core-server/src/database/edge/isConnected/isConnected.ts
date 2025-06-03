import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

export const isConnected = async (source: string, target: string): Promise<boolean> => {
  try {
    const { data, error } = await supabaseClient
      .from(EDGE_TABLE)
      .select('*')
      .or(
        `and(source.eq.${source},target.eq.${target}),and(source.eq.${target},target.eq.${source})`,
      );

    if (error) throw error;
    return data.length > 0;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
    return false;
  }
};
