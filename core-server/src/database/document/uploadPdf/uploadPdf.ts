import { postgresClient } from '../../postgresClient';
import * as fs from 'fs';
import * as path from 'path';

export const uploadPdf = async (file: Express.Multer.File, filePath: string): Promise<void> => {
  try {
    // PDF upload functionality disabled - previously used Supabase storage buckets
    // TODO: Implement proper file storage solution if needed
    console.log(`PDF upload skipped for file: ${filePath}`);
    return;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};
