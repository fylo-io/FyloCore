import { User } from '../../../types/user';
import { USER_TABLE, pool } from '../../postgresClient';

export const createUser = async (newUser: Omit<User, 'id' | 'created_at'>): Promise<User | null> => {
  try {
    const query = `
      INSERT INTO ${USER_TABLE} (name, email, password, type, verified, profile_color, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.type,
      newUser.verified,
      newUser.profile_color,
      newUser.avatar_url
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
