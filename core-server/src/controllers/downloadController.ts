import { Request, Response } from 'express';

import { DOWNLOAD_BUCKET, supabaseClient } from '../database/supabaseClient';
import { handleErrors } from '../utils/errorHandler';

// File paths in Supabase storage
const FILES = {
  windows: 'fylo-desktop-v1.0.0-win-x64.exe',
  mac: 'fylo-desktop-v1.0.0-mac.dmg',
};

/**
 * Generate a signed URL for Windows app download
 * @param req - Express request
 * @param res - Express response
 */
export const getWindowsDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(DOWNLOAD_BUCKET)
      .createSignedUrl(FILES.windows, 60 * 60); // 1 hour expiry

    if (error) throw error;

    if (!data?.signedUrl) {
      res.status(404).json({ error: 'Download file not found' });
      return;
    }

    res.status(200).json({ downloadUrl: data.signedUrl });
  } catch (error) {
    handleErrors('Error generating Windows download URL:', error as Error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};

/**
 * Generate a signed URL for Mac app download
 * @param req - Express request
 * @param res - Express response
 */
export const getMacDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(DOWNLOAD_BUCKET)
      .createSignedUrl(FILES.mac, 60 * 60); // 1 hour expiry

    if (error) throw error;

    if (!data?.signedUrl) {
      res.status(404).json({ error: 'Download file not found' });
      return;
    }

    res.status(200).json({ downloadUrl: data.signedUrl });
  } catch (error) {
    handleErrors('Error generating Mac download URL:', error as Error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};
