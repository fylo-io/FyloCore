import { FyloEdge } from '../../../types/graph';
import { EDGE_TABLE, pool } from '../../postgresClient';

export const createEdge = async (edge: FyloEdge): Promise<FyloEdge | null> => {
  try {
    const query = `
      INSERT INTO ${EDGE_TABLE} (id, graph_id, source, target, type, data, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      edge.id,
      edge.graph_id,
      edge.source,
      edge.target,
      edge.type,
      JSON.stringify(edge.data),
      edge.created_at || new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse the data field back to object
    const returnedEdge = result.rows[0];
    if (typeof returnedEdge.data === 'string') {
      returnedEdge.data = JSON.parse(returnedEdge.data);
    }
    
    return returnedEdge as FyloEdge;
  } catch (error) {
    console.error('Error creating edge:', error);
    throw error;
  }
};
