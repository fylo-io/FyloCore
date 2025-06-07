import * as fs from 'fs';
import * as path from 'path';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Local storage directory for avatars
const AVATAR_STORAGE_DIR = path.join(__dirname, '..', '..', 'storage', 'avatars');

// Ensure storage directory exists
if (!fs.existsSync(AVATAR_STORAGE_DIR)) {
  fs.mkdirSync(AVATAR_STORAGE_DIR, { recursive: true });
}

/**
 * Uploads an avatar image to local filesystem
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
    const userDir = path.join(AVATAR_STORAGE_DIR, userId);
    
    // Ensure user directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    const filePath = path.join(userDir, uniqueFilename);

    // Write file to local storage
    fs.writeFileSync(filePath, file);

    // Generate URL for the uploaded file (relative to server)
    const publicUrl = `/storage/avatars/${userId}/${uniqueFilename}`;

    // Return the success result with the URL
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Storage Error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

/**
 * Removes an avatar from local filesystem
 * @param path The path of the file to delete (relative to avatars directory)
 * @returns An object indicating success or failure
 */
export const removeAvatar = async (filePath: string): Promise<UploadResult> => {
  try {
    // Convert relative path to absolute path
    const absolutePath = path.join(AVATAR_STORAGE_DIR, filePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Storage Error:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
