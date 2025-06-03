import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const markEmailAsVerified = async (email: string): Promise<User | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .update({ verified: true })
      .eq('email', email)
      .not('password', 'is', null)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
