import { supabaseClient, USER_TABLE } from '../../supabaseClient';

/**
 * Update a user's password in the database
 * @param userId - The ID of the user
 * @param hashedPassword - The new hashed password
 * @returns The updated user or undefined if not found
 */
export const updateUserPassword = async (userId: string, hashedPassword: string) => {
  try {
    const { data, error } = await supabaseClient
      .from(USER_TABLE)
      .update({ password: hashedPassword })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user password:', error);
      return undefined;
    }

    return data;
  } catch (error) {
    console.error('Error updating user password:', error);
    return undefined;
  }
};
