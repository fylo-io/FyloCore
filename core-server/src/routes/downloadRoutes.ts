import { Router } from 'express';

import { getMacDownload, getWindowsDownload } from '../controllers/downloadController';

const router = Router();

/**
 * @swagger
 * /api/download/windows:
 *   get:
 *     tags:
 *       - Downloads
 *     summary: Download Windows application
 *     description: Get a signed URL for downloading the Windows desktop application
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadUrl:
 *                   type: string
 *                   description: Signed URL for downloading the Windows application
 *       404:
 *         description: Download file not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/windows', getWindowsDownload);

/**
 * @swagger
 * /api/download/mac:
 *   get:
 *     tags:
 *       - Downloads
 *     summary: Download Mac application
 *     description: Get a signed URL for downloading the macOS desktop application
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloadUrl:
 *                   type: string
 *                   description: Signed URL for downloading the Mac application
 *       404:
 *         description: Download file not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/mac', getMacDownload);

export default router;
