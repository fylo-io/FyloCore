import { Note } from '../../../types/note';
import { handleErrors } from '../../../utils/errorHandler';
import { NOTE_TABLE, supabaseClient } from '../../supabaseClient';

export const readNotesByUserName = async (userName: string): Promise<Note[] | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NOTE_TABLE)
      .select('*')
      .eq('author', userName);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
