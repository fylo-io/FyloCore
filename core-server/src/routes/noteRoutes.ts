import { Router } from 'express';

import { createNoteHandler, getNotesByUserNameHandler } from '../controllers/noteController';

const router = Router();

/**
 * @swagger
 * /api/notes/{userName}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get notes by username
 *     description: Retrieve all notes created by a specific user
 *     parameters:
 *       - in: path
 *         name: userName
 *         schema:
 *           type: string
 *         required: true
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
 *                     $ref: '#/components/schemas/Note'
 *       400:
 *         description: Unable to fetch notes or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/:userName', getNotesByUserNameHandler);

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     description: Create a new note associated with a node
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
 *         description: Unable to create note or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/', createNoteHandler);

export default router;
