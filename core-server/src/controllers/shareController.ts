import { Request, Response } from 'express';

import { createShare } from '../database/share/createShare/createShare';
import { readUserByNameOrEmailAll } from '../database/user/readUserByNameOrEmailAll/readUserByNameOrEmailAll';

/**
 * Share a graph with another user
 * @param req - Express request containing graphId and username
 * @param res - Express response
 */
export const createShareHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { graphId, usernameOrEmail } = req.body;

    if (!graphId || !usernameOrEmail) {
      res.status(400).json({ error: 'Graph ID and user are required' });
      return;
    }

    const user = await readUserByNameOrEmailAll(usernameOrEmail);

    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    await createShare(graphId, user);

    res.status(201).json({ message: 'Graph shared successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
