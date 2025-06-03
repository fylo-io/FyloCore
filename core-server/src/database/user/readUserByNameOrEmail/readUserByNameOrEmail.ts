import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const readUserByNameOrEmail = async (nameOrEmail: string): Promise<User | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .select('*')
      .or(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`)
      .not('password', 'is', null)
      .single();

    if (error) return undefined;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
    return undefined;
  }
};
