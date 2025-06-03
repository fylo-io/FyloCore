/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The document's unique identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the document was created
 *         title:
 *           type: string
 *           description: The title of the document
 *         content:
 *           type: string
 *           description: The document's content or abstract
 *         source_type:
 *           type: string
 *           description: The source type of the document (e.g., journal, conference)
 *         doi:
 *           type: string
 *           description: Digital Object Identifier for the document
 *         publication_year:
 *           type: integer
 *           description: Year when the document was published
 *         publication_date:
 *           type: string
 *           format: date
 *           description: Full date when the document was published
 *         type:
 *           type: string
 *           description: Type of document (e.g., article, book, chapter)
 *         is_oa:
 *           type: boolean
 *           description: Whether the document is open access
 *         oa_status:
 *           type: string
 *           description: Open access status (e.g., gold, green, bronze)
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *           description: List of document authors
 *         pdf_url:
 *           type: string
 *           description: URL to the PDF version of the document
 */

export interface Document {
  id: string;
  created_at: Date;
  title: string;
  content: string;
  source_type?: string;
  doi?: string;
  publication_year?: number;
  publication_date?: Date;
  type?: string;
  is_oa?: boolean;
  oa_status?: string;
  authors?: string[];
  pdf_url?: string;
}
