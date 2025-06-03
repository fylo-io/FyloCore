import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const readUserByNameOrByEmail = async (
  name: string,
  email: string,
): Promise<User | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .select('*')
      .or(`name.eq.${name},email.eq.${email}`)
      .not('password', 'is', null)
      .single();

    if (error) return undefined;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
