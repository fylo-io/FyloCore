import { USER_TABLE, pool } from '../../postgresClient';

export const getUserIdByName = async (name: string): Promise<string | null> => {
  try {
    const query = `SELECT id FROM ${USER_TABLE} WHERE name = $1 LIMIT 1`;
    const result = await pool.query(query, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error getting user ID by name:', error);
    throw error;
  }
};
