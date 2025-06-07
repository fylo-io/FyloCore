import { FyloNode } from '../../../types/graph';
import { NODE_TABLE, pool } from '../../postgresClient';

export const saveNodePositions = async (nodes: FyloNode[]): Promise<void> => {
  try {
    for (const node of nodes) {
      await pool.query(
        `UPDATE ${NODE_TABLE} SET position = $1 WHERE id = $2`,
        [JSON.stringify(node.position), node.id]
      );
    }
  } catch (error) {
    console.error('Error saving node positions:', error);
    throw error;
  }
};
