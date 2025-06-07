import { Note } from '../../../types/note';
import { NOTE_TABLE, pool } from '../../postgresClient';
import * as crypto from 'crypto';

export const createNote = async (note: Omit<Note, 'id' | 'created_at'>): Promise<Note | null> => {
  try {
    const query = `
      INSERT INTO ${NOTE_TABLE} (id, author, node_id, text, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      crypto.randomUUID(),
      note.author,
      note.node_id,
      note.text,
      new Date().toISOString()
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Note;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};
