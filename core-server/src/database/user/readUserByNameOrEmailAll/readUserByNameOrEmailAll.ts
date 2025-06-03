import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const readUserByNameOrEmailAll = async (nameOrEmail: string): Promise<User | undefined> => {
  try {
    const { data: nameData } = await supabaseClient
      .from(USER_TABLE)
      .select('*')
      .eq('name', nameOrEmail)
      .maybeSingle();

    if (nameData) return nameData;

    const { data: emailData, error } = await supabaseClient
      .from(USER_TABLE)
      .select('*')
      .eq('email', nameOrEmail)
      .maybeSingle();

    if (error) return undefined;
    return emailData;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
    return undefined;
  }
};
