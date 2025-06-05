import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { generateRandomColor } from '../../../utils/helpers';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const createUser = async (
  name: string,
  email: string,
  password: string,
): Promise<User | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .insert([
        {
          name,
          email,
          password,
          verified: true,
          profile_color: generateRandomColor(),
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
