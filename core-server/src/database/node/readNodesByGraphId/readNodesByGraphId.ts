import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, pool } from '../../postgresClient';

export const readNodesByGraphId = async (graphId: string): Promise<FyloNode[] | undefined> => {
  try {
    const query = `SELECT * FROM ${NODE_TABLE} WHERE graph_id = $1`;
    const result = await pool.query(query, [graphId]);

    return result.rows as FyloNode[];
  } catch (error) {
    handleErrors('Error reading nodes by graph ID:', error as Error);
  }
};
