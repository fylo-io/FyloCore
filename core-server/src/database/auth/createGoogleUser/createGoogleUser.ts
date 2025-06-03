import { UserType } from '../../../consts';
import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { generateRandomColor } from '../../../utils/helpers';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const createGoogleUser = async (
  name: string,
  email: string,
  image: string,
): Promise<User | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .insert([
        {
          name,
          email,
          profile_color: generateRandomColor(),
          type: UserType.GOOGLE,
          verified: true,
          avatar_url: image,
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
