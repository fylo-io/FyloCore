import { handleErrors } from '../utils/errorHandler';

import { AVATAR_BUCKET, supabaseClient } from './supabaseClient';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an avatar image to Supabase Storage
 * @param userId The user ID to associate with the avatar
 * @param file The file buffer to upload
 * @param filename Original filename
 * @param contentType The MIME type of the file
 * @returns An object containing the upload result
 */
export const uploadAvatar = async (
  userId: string,
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<UploadResult> => {
  try {
    // Create a unique filename to prevent collisions
    const uniqueFilename = `${userId}_${Date.now()}_${filename}`;
    const filePath = `${userId}/${uniqueFilename}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

    // Return the success result with the URL
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    handleErrors('Storage Error:', error as Error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Removes an avatar from Supabase Storage
 * @param path The path of the file to delete
 * @returns An object indicating success or failure
 */
export const removeAvatar = async (path: string): Promise<UploadResult> => {
  try {
    const { error } = await supabaseClient.storage.from(AVATAR_BUCKET).remove([path]);

    if (error) throw error;

    return {
      success: true,
    };
  } catch (error) {
    handleErrors('Storage Error:', error as Error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
