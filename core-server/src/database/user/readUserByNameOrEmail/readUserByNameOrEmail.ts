import { User } from '../../../types/user';
import { USER_TABLE, pool } from '../../postgresClient';

export const readUserByNameOrEmail = async (nameOrEmail: string): Promise<User | null> => {
  try {
    // Use raw SQL for OR condition
    const query = `SELECT * FROM ${USER_TABLE} WHERE name = $1 OR email = $1 LIMIT 1`;
    const result = await pool.query(query, [nameOrEmail]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error reading user by name or email:', error);
    throw error;
  }
};
