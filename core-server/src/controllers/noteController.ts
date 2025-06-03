import { Request, Response } from 'express';

import { createNote } from '../database/note/createNote/createNote';
import { readNotesByUserName } from '../database/note/readNotesByUserName/readNotesByUserName';

/**
 * Get notes by username
 * @param req - Express request with username in path params
 * @param res - Express response
 */
export const getNotesByUserNameHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName } = req.params;

    if (!userName) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const notes = await readNotesByUserName(userName);

    if (notes) {
      res.status(200).json({ notes });
    } else {
      res.status(400).json({ error: 'Unable to fetch notes' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Create a new note
 * @param req - Express request with note data in body
 * @param res - Express response
 */
export const createNoteHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { author, nodeId, text } = req.body;

    if (!author || !nodeId || !text) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const createdNote = await createNote(author, nodeId, text);

    if (createdNote) {
      res.status(201).json({ note: createdNote });
    } else {
      res.status(400).json({ error: 'Unable to create Note' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
