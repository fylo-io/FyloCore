import { FyloEdge } from '../../../types/graph';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const updateEdge = async (edgeId: string, updateData: Partial<FyloEdge>): Promise<FyloEdge | null> => {
  try {
    // Build update query with raw SQL since query builder has WHERE value tracking issues
    const columns = Object.keys(updateData);
    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    const query = `UPDATE ${EDGE_TABLE} SET ${setClauses.join(', ')} WHERE id = $${columns.length + 1} RETURNING *`;
    const values = [...Object.values(updateData), edgeId];
    
    const result = await pool.query(query, values);
    
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error updating edge:', error);
    throw error;
  }
};
