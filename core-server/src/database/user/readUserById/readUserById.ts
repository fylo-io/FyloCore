import { User } from '../../../types/user';
import { USER_TABLE, pool } from '../../postgresClient';

export const readUserById = async (id: string): Promise<User | null> => {
  try {
    const query = `SELECT * FROM ${USER_TABLE} WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error reading user by ID:', { data: null, error });
    throw error;
  }
};
