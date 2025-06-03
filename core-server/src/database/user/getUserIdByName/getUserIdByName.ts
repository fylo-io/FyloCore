import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const getUserIdByName = async (name: string): Promise<string | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .select('id')
      .eq('name', name)
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
