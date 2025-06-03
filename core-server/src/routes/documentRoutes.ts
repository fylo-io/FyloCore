import { Router } from 'express';

import {
  extractContentFromUrlHandler,
  extractDocumentFromDoiHandler,
  extractDocumentFromPdfHandler,
  extractReferencesFromPdfHandler,
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
 *       500:
 *         description: Server error while fetching or processing the PDF
 */
router.post('/url', extractContentFromUrlHandler);

/**
 * @swagger
 * /api/document/extract-references:
 *   post:
 *     tags:
 *       - Documents
 *     summary: Extract references from a PDF document
 *     description: Upload a PDF file to extract its bibliographic references using GROBID
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
 *                 description: PDF file to extract references from
 *     responses:
 *       200:
 *         description: References extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     references:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ref_id:
 *                             type: string
 *                             description: Reference identifier
 *                           title:
 *                             type: string
 *                             description: Reference title
 *                           authors:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: List of author names
 *                           year:
 *                             type: string
 *                             description: Publication year
 *                           doi:
 *                             type: string
 *                             nullable: true
 *                             description: Digital Object Identifier
 *                           url:
 *                             type: string
 *                             nullable: true
 *                             description: URL associated with the reference
 *                     total_references:
 *                       type: integer
 *                       description: Total number of references extracted
 *                     processed_at:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp of when processing occurred
 *       400:
 *         description: Bad request, missing file, invalid file type, or file size exceeds limit
 *       500:
 *         description: Server error while processing the file
 */
router.post('/extract-references', upload.single('file'), extractReferencesFromPdfHandler);

export default router;
