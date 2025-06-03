import { UserProfile } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

export const readUserProfiles = async (): Promise<UserProfile[] | undefined> => {
  try {
    const { data, error } = await supabaseClient.from(USER_TABLE).select('id, name, profile_color');

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
