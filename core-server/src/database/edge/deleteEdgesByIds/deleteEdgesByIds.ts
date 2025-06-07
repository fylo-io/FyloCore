import { EDGE_TABLE, pool } from '../../postgresClient';

export const deleteEdgesByIds = async (edgeIds: string[]): Promise<void> => {
  try {
    if (edgeIds.length === 0) return;
    
    const placeholders = edgeIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `DELETE FROM ${EDGE_TABLE} WHERE id IN (${placeholders})`;
    
    await pool.query(query, edgeIds);
  } catch (error) {
    console.error('Error deleting edges by IDs:', error);
    throw error;
  }
};
