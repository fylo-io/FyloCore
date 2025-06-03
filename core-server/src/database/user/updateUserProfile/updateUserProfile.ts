import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

interface UserProfileUpdate {
  profile_color: string;
  avatar_url?: string | null;
}

interface UpdateProfileResult {
  success: boolean;
  data?: User;
  error?: string;
}

export const updateUserProfile = async (
  id: string,
  profileColor: string,
  avatarUrl: string | null | undefined,
): Promise<UpdateProfileResult> => {
  try {
    const updateData: UserProfileUpdate = {
      profile_color: profileColor,
    };

    if (avatarUrl !== null) {
      updateData.avatar_url = avatarUrl;
    }

    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
