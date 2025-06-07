import { FyloNode } from '../../../types/graph';
import { NODE_TABLE, pool } from '../../postgresClient';

export const readNodesByNodeId = async (id: string): Promise<FyloNode | null> => {
  try {
    const query = `SELECT * FROM ${NODE_TABLE} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as FyloNode;
  } catch (error) {
    console.error('Error reading node by ID:', error);
    throw error;
  }
};
