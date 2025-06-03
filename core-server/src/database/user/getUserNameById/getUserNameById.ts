import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const getUserNameById = async (id: string): Promise<string | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .select('name')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data.name;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
