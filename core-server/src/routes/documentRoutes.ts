import { Router } from 'express';

import {
  extractContentFromUrlHandler,
  extractDocumentFromDoiHandler,
  extractDocumentFromPdfHandler,
} from '../controllers/documentController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @swagger
 * /api/document/doi:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Extract document information from DOIs
 *     description: Fetch document metadata from DOIs, retrieve from database if already exists
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dois
 *             properties:
 *               dois:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of DOI strings
 *                 example: ["10.1038/s41586-021-03380-y", "10.1073/pnas.2022376118"]
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request, missing DOIs or unable to fetch documents
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Server error
 */
router.post('/doi', extractDocumentFromDoiHandler);

/**
 * @swagger
 * /api/document/pdf:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Extract content and metadata from PDF file
 *     description: Upload a PDF file to extract its text content and metadata
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to extract data from
 *     responses:
 *       200:
 *         description: Content extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Document'
 *                 - type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: Extracted text content from the PDF
 *       400:
 *         description: Bad request, missing file, invalid file type, or file size exceeds limit
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Server error while processing the file
 */
router.post('/pdf', upload.single('file'), extractDocumentFromPdfHandler);

/**
 * @swagger
 * /api/document/url:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Extract content from a PDF URL
 *     description: Fetch and extract text content from a PDF URL
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL to a PDF file
 *                 example: "https://example.com/sample.pdf"
 *     responses:
 *       200:
 *         description: Content extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Extracted text content from the PDF
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Server error while fetching or processing the PDF
 */
router.post('/url', extractContentFromUrlHandler);

export default router;
