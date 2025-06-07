import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOWNLOAD_DIR } from '../database/postgresClient';

/**
 * Generate a signed URL for Windows app download
 * @param req - Express request
 * @param res - Express response
 */
export const getWindowsDownload = async (req: Request, res: Response) => {
  try {
    console.log('Fetching Windows download...');
    
    const fileName = 'fylo-windows.zip';
    const filePath = path.join(DOWNLOAD_DIR, fileName);
    
    // Check if file exists
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({ 
        error: 'Windows download not found',
        message: 'The Windows installation file is not available. Please contact support.' 
      });
    }

    // Get file stats for content length
    const stats = await fs.stat(filePath);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log('✅ Windows download served successfully');
  } catch (error) {
    console.error('❌ Error fetching Windows download:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Windows download',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate a signed URL for Mac app download
 * @param req - Express request
 * @param res - Express response
 */
export const getMacDownload = async (req: Request, res: Response) => {
  try {
    console.log('Fetching Mac download...');
    
    const fileName = 'fylo-mac.dmg';
    const filePath = path.join(DOWNLOAD_DIR, fileName);
    
    // Check if file exists
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      return res.status(404).json({ 
        error: 'Mac download not found',
        message: 'The Mac installation file is not available. Please contact support.' 
      });
    }

    // Get file stats for content length
    const stats = await fs.stat(filePath);
    
    res.setHeader('Content-Type', 'application/x-apple-diskimage');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log('✅ Mac download served successfully');
  } catch (error) {
    console.error('❌ Error fetching Mac download:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Mac download',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
