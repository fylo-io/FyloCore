import { Router, Request, Response } from 'express';

import { getMacDownload, getWindowsDownload } from '../controllers/downloadController';

const router = Router();

/**
 * @swagger
 * /api/download/windows:
 *   get:
 *     tags:
 *       - Downloads
 *     summary: Download Windows application installer
 *     description: Downloads the Fylo Windows application installer zip file
 *     responses:
 *       200:
 *         description: Windows installer file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Windows installer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Windows download not found
 *                 message:
 *                   type: string
 *                   example: The Windows installation file is not available. Please contact support.
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
router.get('/windows', async (req: Request, res: Response) => {
  await getWindowsDownload(req, res);
});

/**
 * @swagger
 * /api/download/mac:
 *   get:
 *     tags:
 *       - Downloads
 *     summary: Download Mac application installer
 *     description: Downloads the Fylo Mac application installer zip file
 *     responses:
 *       200:
 *         description: Mac installer file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Mac installer not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Mac download not found
 *                 message:
 *                   type: string
 *                   example: The Mac installation file is not available. Please contact support.
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
router.get('/mac', async (req: Request, res: Response) => {
  await getMacDownload(req, res);
});

export default router;
