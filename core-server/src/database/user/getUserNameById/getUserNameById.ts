import { USER_TABLE, pool } from '../../postgresClient';

export const getUserNameById = async (id: string): Promise<string | null> => {
  try {
    const query = `SELECT name FROM ${USER_TABLE} WHERE id = $1 LIMIT 1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].name;
  } catch (error) {
    console.error('Error getting user name by ID:', error);
    throw error;
  }
};
