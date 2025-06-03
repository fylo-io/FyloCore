import { Document } from '../../../types/document';
import { handleErrors } from '../../../utils/errorHandler';
import { DOCUMENT_TABLE, supabaseClient } from '../../supabaseClient';

export const readDocumentsByDois = async (dois: string[]): Promise<Document[] | undefined> => {
  try {
    const { data, error } = await supabaseClient.from(DOCUMENT_TABLE).select('*').in('doi', dois);

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
