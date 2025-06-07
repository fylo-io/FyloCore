import { Document } from '../../../types/document';
import { DOCUMENT_TABLE, pool } from '../../postgresClient';

export const readDocumentsByDois = async (dois: string[]): Promise<Document[]> => {
  try {
    if (dois.length === 0) {
      return [];
    }

    const placeholders = dois.map((_, i) => `$${i + 1}`).join(', ');
    const query = `SELECT * FROM ${DOCUMENT_TABLE} WHERE doi IN (${placeholders})`;
    
    const result = await pool.query(query, dois);
    
    return result.rows as Document[];
  } catch (error) {
    console.error('Error reading documents by DOIs:', error);
    throw error;
  }
};
