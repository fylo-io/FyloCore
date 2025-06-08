import { randomUUID } from 'crypto';
import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, pool } from '../../postgresClient';

export const createUser = async (userData: Omit<User, 'id' | 'created_at'>): Promise<User | null> => {
  try {
    const query = `
      INSERT INTO ${USER_TABLE} (id, name, email, password, type, profile_color, avatar_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    // Generate a UUID for the user ID
    const userId = randomUUID();
    
    const values = [
      userId,
      userData.name,
      userData.email,
      userData.password,
      userData.type,
      userData.profile_color,
      userData.avatar_url,
      new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error creating user:', error);
    handleErrors('PostgreSQL Error:', error as Error);
    return null;
  }
};
