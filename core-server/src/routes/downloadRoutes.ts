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
 *     description: Downloads the Fylo Windows application installer zip file (public endpoint)
 *     responses:
 *       200:
 *         description: Windows installer file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     description: Downloads the Fylo Mac application installer zip file (public endpoint)
 *     responses:
 *       200:
 *         description: Mac installer file
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/mac', async (req: Request, res: Response) => {
  await getMacDownload(req, res);
});

export default router;
