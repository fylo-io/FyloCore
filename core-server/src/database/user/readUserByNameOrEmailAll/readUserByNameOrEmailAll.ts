import { User } from '../../../types/user';
import { USER_TABLE, pool } from '../../postgresClient';

export const readUserByNameOrEmailAll = async (usernameOrEmail: string): Promise<User | null> => {
  try {
    // First try to find by name
    let query = `SELECT * FROM ${USER_TABLE} WHERE name = $1 LIMIT 1`;
    let result = await pool.query(query, [usernameOrEmail]);
    
    if (result.rows.length > 0) {
      return result.rows[0] as User;
    }
    
    // If not found by name, try by email
    query = `SELECT * FROM ${USER_TABLE} WHERE email = $1 LIMIT 1`;
    result = await pool.query(query, [usernameOrEmail]);
    
    if (result.rows.length > 0) {
      return result.rows[0] as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading user by name or email:', error);
    throw error;
  }
};
