import { UserType } from '../../../consts';
import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const readGoogleUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from(USER_TABLE)
      .select('*')
      .eq('email', email)
      .eq('type', UserType.GOOGLE)
      .single();

    if (fetchError) throw fetchError;
    return existingUser;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
