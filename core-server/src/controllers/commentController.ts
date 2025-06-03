import { Request, Response } from 'express';

import { readCommentsByGraphId } from '../database/comment/readCommentsByGraphId/readCommentsByGraphId';
import { handleErrors } from '../utils/errorHandler';

/**
 * Fetch comments by graph ID
 * @param req - Express request with graphId parameter
 * @param res - Express response
 */
export const getCommentsByGraphIdHandler = async (req: Request, res: Response): Promise<void> => {
  const { graphId } = req.params;

  try {
    const comments = await readCommentsByGraphId(graphId);

    if (comments) {
      res.status(200).json({ comments });
    } else {
      res.status(400).json({ error: 'Unable to fetch comments' });
    }
  } catch (error) {
    handleErrors('Error fetching comments:', error as Error);
    res.status(500).json({ error: 'An error occurred while fetching comments' });
  }
};
