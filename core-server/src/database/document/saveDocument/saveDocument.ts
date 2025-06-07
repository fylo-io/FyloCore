import { Document } from '../../../types/document';
import { handleErrors } from '../../../utils/errorHandler';
import { DocumentContent } from '../../../utils/helpers';
import { DOCUMENT_TABLE, pool } from '../../postgresClient';
import * as crypto from 'crypto';

export const saveDocument = async (
  documentData: DocumentContent,
): Promise<Document | null> => {
  try {
    const query = `
      INSERT INTO ${DOCUMENT_TABLE} (id, title, content, source_type, doi, publication_year, publication_date, type, is_oa, oa_status, authors, pdf_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      crypto.randomUUID(),
      documentData.title,
      documentData.content,
      documentData.source_type || null,
      documentData.doi || null,
      documentData.publication_year || null,
      documentData.publication_date || null,
      documentData.type || null,
      documentData.is_oa || null,
      documentData.oa_status || null,
      documentData.authors ? JSON.stringify(documentData.authors) : null,
      null, // pdf_url
      new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Parse JSON fields back to objects
    const returnedDocument = result.rows[0];
    if (typeof returnedDocument.authors === 'string') {
      returnedDocument.authors = JSON.parse(returnedDocument.authors);
    }
    
    return returnedDocument as Document;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};
