import { User } from '../../../types/user';
import { USER_TABLE, pool } from '../../postgresClient';

interface UpdateProfileResult {
  success: boolean;
  data?: User;
  error?: string;
}

export const updateUserProfile = async (
  userId: string,
  updateData: Partial<User>
): Promise<UpdateProfileResult> => {
  try {
    // Build update query with raw SQL
    const columns = Object.keys(updateData);
    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    const query = `UPDATE ${USER_TABLE} SET ${setClauses.join(', ')} WHERE id = $${columns.length + 1} RETURNING *`;
    const values = [...Object.values(updateData), userId];
    
    const result = await pool.query(query, values);
    
    return {
      success: true,
      data: result.rows && result.rows.length > 0 ? result.rows[0] : null,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
