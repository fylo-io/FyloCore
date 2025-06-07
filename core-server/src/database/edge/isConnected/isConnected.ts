import { EDGE_TABLE, pool } from '../../postgresClient';

export const isConnected = async (source: string, target: string): Promise<boolean> => {
  try {
    const query = `SELECT COUNT(*) as count FROM ${EDGE_TABLE} WHERE source = $1 AND target = $2`;
    const result = await pool.query(query, [source, target]);
    
    return result.rows && result.rows.length > 0 && parseInt(result.rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking connection:', error);
    throw error;
  }
};
