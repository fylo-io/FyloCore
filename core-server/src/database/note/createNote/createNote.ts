import { Note } from '../../../types/note';
import { handleErrors } from '../../../utils/errorHandler';
import { NOTE_TABLE, supabaseClient } from '../../supabaseClient';

export const createNote = async (
  author: string,
  nodeId: string,
  text: string,
): Promise<Note | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(NOTE_TABLE)
      .insert([
        {
          created_at: new Date(),
          author: author,
          node_id: nodeId,
          text: text,
        },
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
