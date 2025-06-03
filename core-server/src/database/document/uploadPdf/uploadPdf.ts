import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

export const uploadPdf = async (file: Express.Multer.File, filePath: string): Promise<void> => {
  try {
    const { error } = await supabaseClient.storage.from('fylo-pdf').upload(filePath, file.buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  } catch (error) {
    handleErrors('Supabase Error:', error as Error);
  }
};
