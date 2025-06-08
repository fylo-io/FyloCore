import { Router } from 'express';

import { createNoteHandler, getNotesByUserNameHandler } from '../controllers/noteController';

const router = Router();

/**
 * @swagger
 * /api/notes/{username}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get notes by username
 *     description: Retrieve all notes created by a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the note author
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Note'
 *                       - type: object
 *                         properties:
 *                           author_name:
 *                             type: string
 *                             description: Name of the note author
 *                           author_profile_color:
 *                             type: string
 *                             description: Profile color of the author
 *             example:
 *               notes:
 *                 - id: "note-abc123"
 *                   created_at: "2023-04-01T12:00:00Z"
 *                   author: "user-abc123"
 *                   author_name: "John Doe"
 *                   author_profile_color: "#3498db"
 *                   node_id: "node-xyz789"
 *                   text: "Important research findings about neural networks"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:username', getNotesByUserNameHandler);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     description: Create a new note associated with a node
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - author
 *               - nodeId
 *               - text
 *             properties:
 *               author:
 *                 type: string
 *                 description: Username of the note author
 *               nodeId:
 *                 type: string
 *                 description: ID of the node this note is associated with
 *               text:
 *                 type: string
 *                 description: Content of the note
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', createNoteHandler);

export default router;
