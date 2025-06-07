import { Note } from '../../../types/note';
import { NOTE_TABLE, pool } from '../../postgresClient';

export const readNotesByUserName = async (userName: string): Promise<Note[]> => {
  try {
    const query = `
      SELECT * FROM ${NOTE_TABLE}
      WHERE author = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userName]);
      
    return result.rows as Note[];
  } catch (error) {
    console.error('Error reading notes by user name:', { data: null, error });
    throw error;
  }
};
