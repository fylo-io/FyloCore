import { FyloNode } from '../../../types/graph';
import { NODE_TABLE, pool } from '../../postgresClient';

export const updateNode = async (nodeId: string, updateData: Partial<FyloNode>): Promise<FyloNode | null> => {
  try {
    // Build update clauses for allowed fields
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Handle each field that can be updated
    if (updateData.type !== undefined) {
      setClauses.push(`type = $${paramIndex}`);
      values.push(updateData.type);
      paramIndex++;
    }

    if (updateData.position !== undefined) {
      setClauses.push(`position = $${paramIndex}`);
      values.push(JSON.stringify(updateData.position));
      paramIndex++;
    }

    if (updateData.data !== undefined) {
      setClauses.push(`data = $${paramIndex}`);
      values.push(JSON.stringify(updateData.data));
      paramIndex++;
    }

    if (updateData.measured !== undefined) {
      setClauses.push(`measured = $${paramIndex}`);
      values.push(JSON.stringify(updateData.measured));
      paramIndex++;
    }

    if (updateData.selected !== undefined) {
      setClauses.push(`selected = $${paramIndex}`);
      values.push(updateData.selected);
      paramIndex++;
    }

    if (updateData.dragging !== undefined) {
      setClauses.push(`dragging = $${paramIndex}`);
      values.push(updateData.dragging);
      paramIndex++;
    }

    if (updateData.hidden !== undefined) {
      setClauses.push(`hidden = $${paramIndex}`);
      values.push(updateData.hidden);
      paramIndex++;
    }

    if (updateData.embeddings !== undefined) {
      setClauses.push(`embeddings = $${paramIndex}`);
      values.push(updateData.embeddings ? updateData.embeddings.join(',') : null);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      console.warn('No valid fields to update');
      return null;
    }

    // Add nodeId as the last parameter
    values.push(nodeId);
    
    const query = `
      UPDATE ${NODE_TABLE} 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows && result.rows.length > 0) {
      const returnedNode = result.rows[0];
      
      // Parse JSON fields back to objects
      if (typeof returnedNode.position === 'string') {
        returnedNode.position = JSON.parse(returnedNode.position);
      }
      if (typeof returnedNode.data === 'string') {
        returnedNode.data = JSON.parse(returnedNode.data);
      }
      if (typeof returnedNode.measured === 'string') {
        returnedNode.measured = JSON.parse(returnedNode.measured);
      }
      // Convert embeddings string back to array
      if (returnedNode.embeddings && typeof returnedNode.embeddings === 'string') {
        returnedNode.embeddings = returnedNode.embeddings.split(',').map(Number);
      }
      
      return returnedNode as FyloNode;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating node:', error);
    throw error;
  }
};
