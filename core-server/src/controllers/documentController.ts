import fs from 'fs';
import path from 'path';

import { Request, Response } from 'express';
import pdfParse from 'pdf-parse';

import { MAX_FILE_SIZE } from '../consts';
import { readDocumentsByDois } from '../database/document/readDocumentsByDois/readDocumentsByDois';
import { saveDocument } from '../database/document/saveDocument/saveDocument';
import { uploadPdf } from '../database/document/uploadPdf/uploadPdf';
import { handleErrors } from '../utils/errorHandler';
import { getDocumentFromDoi } from '../utils/helpers';

// Create a proper temp directory within the application structure
const TEMP_DIR = path.join(process.cwd(), '.tmp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Extract document information from DOIs
 * @param req - Express request with array of DOIs
 * @param res - Express response with document data
 */
export const extractDocumentFromDoiHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dois } = req.body;

    if (!dois) {
      res.status(400).json({ error: 'DOIs are required' });
      return;
    }

    const uniqueDois: string[] = [...new Set(dois)] as string[];

    const documents = await readDocumentsByDois(uniqueDois);

    if (documents) {
      const missingDois = uniqueDois.filter(
        (doi: string) => !documents.some((document) => document?.doi === doi),
      );

      const newDocuments = [];
      for (const doi of missingDois) {
        const documentFromDoi = await getDocumentFromDoi(doi);
        if (!documentFromDoi) continue;

        const savedDocument = await saveDocument(documentFromDoi);
        if (savedDocument) {
          newDocuments.push(savedDocument);
        }
      }

      // Combine fetched and newly saved documents
      const allDocuments = [...documents, ...newDocuments];

      // Map the final documents array to match the order and count of original dois
      const finalDocuments = dois.map((doi: string) => {
        return allDocuments.find((document) => document.doi === doi);
      });

      res.status(200).json({ documents: finalDocuments });
    } else {
      res.status(400).json({ error: 'Unable to fetch Documents' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Extract content and metadata from uploaded PDF file
 * @param req - Express request with PDF file upload
 * @param res - Express response with extracted content and metadata
 */
export const extractDocumentFromPdfHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (req.file.size > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'File size exceeds the 20MB limit' });
      return;
    }

    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Invalid file type. Only PDF files are allowed.' });
      return;
    }

    const filePath = `pdfs/${new Date().toISOString()}-${req.file.originalname}`;
    await uploadPdf(req.file, filePath);

    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    const doiRegex = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i;
    const doiMatch = pdfText.match(doiRegex);

    const arxivRegex = /\barXiv:(\d{4}\.\d{4,5})(v\d+)?\b/i;
    const arxivMatch = pdfText.match(arxivRegex);

    const doi = doiMatch ? doiMatch[0] : arxivMatch ? `10.48550/arXiv.${arxivMatch[1]}` : null;

    const openAlexData = doi ? await getDocumentFromDoi(doi) : {};

    res.status(200).json({
      ...openAlexData,
      title: req.file.originalname,
      text: pdfText,
    });
  } catch (error) {
    handleErrors('Failed to extract content from PDF:', error as Error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

/**
 * Extract content from a PDF URL
 * @param req - Express request with PDF URL
 * @param res - Express response with extracted text
 */
export const extractContentFromUrlHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = await pdfParse(Buffer.from(buffer));
    res.status(200).json({ text: data.text });
  } catch (error) {
    handleErrors('Failed to extract content from URL:', error as Error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};
