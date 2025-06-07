import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { GRAPH_TABLE, pool } from '../../postgresClient';

export const readPublicGraphs = async (): Promise<FyloGraph[]> => {
  try {
    const query = `
      SELECT * FROM ${GRAPH_TABLE}
      WHERE type = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [GraphType.PUBLIC]);
    
    return result.rows as FyloGraph[];
  } catch (error) {
    console.error('Error reading public graphs:', error);
    throw error;
  }
};
