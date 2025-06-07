import { FyloEdge } from '../../../types/graph';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const deleteEdge = async (edge: FyloEdge): Promise<void> => {
  try {
    const query = `DELETE FROM ${EDGE_TABLE} WHERE id = $1`;
    const result = await pool.query(query, [edge.id]);
    
    if (result.rowCount === 0) {
      console.warn(`Edge with id ${edge.id} not found for deletion`);
    }
  } catch (error) {
    console.error('Error deleting edge:', error);
    throw error;
  }
};
