import { Document } from '../../../types/document';
import { handleErrors } from '../../../utils/errorHandler';
import { DocumentContent } from '../../../utils/helpers';
import { DOCUMENT_TABLE, supabaseClient } from '../../supabaseClient';

export const saveDocument = async (
  documentData: DocumentContent,
): Promise<Document | undefined> => {
  try {
    const { data, error } = await supabaseClient
      .from(DOCUMENT_TABLE)
      .insert([{ ...documentData }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
