import { FyloNode } from '../../../types/graph';
import { pool } from '../../postgresClient';

export const updateNodeData = async (
  nodeId: string,
  graphId: string,
  newData: Partial<FyloNode['data']>,
  // eslint-disable-next-line
) => {
  try {
    // First, fetch the existing node
    const fetchQuery = 'SELECT * FROM knowledge_node WHERE id = $1 AND graph_id = $2';
    const fetchResult = await pool.query(fetchQuery, [nodeId, graphId]);

    if (fetchResult.rows.length === 0) {
      console.warn(`Node with id: ${nodeId} and graphId: ${graphId} not found.`);
      return;
    }

    const existingNode = fetchResult.rows[0];
    const updatedData = { ...existingNode.data, ...newData };

    // Update the node with new data
    const updateQuery = 'UPDATE knowledge_node SET data = $1 WHERE id = $2 AND graph_id = $3 RETURNING *';
    const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedData), nodeId, graphId]);

    return updateResult.rows;
  } catch (error) {
    console.error('Error updating node data:', error);
    throw error;
  }
};
