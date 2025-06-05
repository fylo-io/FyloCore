import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { createUser } from '../database/auth/createUser/createUser';
import { readUserByNameOrByEmail } from '../database/auth/readUserByNameOrByEmail/readUserByNameOrByEmail';
import { readUserByNameOrEmail as getUserByNameOrEmail } from '../database/auth/readUserByNameOrEmail/readUserByNameOrEmail';
import { handleErrors } from '../utils/errorHandler';

/**
 * Create a new regular user
 * @param req - Express request
 * @param res - Express response
 */
export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const createdUser = await createUser(username, email, password);

    if (createdUser) {
      res.status(201).json(createdUser);
    } else {
      res.status(400).json({ error: 'Unable to create user' });
    }
  } catch (error) {
    handleErrors('Error creating user:', error as Error);
    res.status(500).json({ error: 'An error occurred while creating user' });
  }
};

/**
 * Check if a user exists by username or email
 * @param req - Express request
 * @param res - Express response
 */
export const readUserByNameOrByEmailHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, email } = req.body;
    const existingUser = await readUserByNameOrByEmail(username, email);

    if (existingUser) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    handleErrors('Error fetching user:', error as Error);
    res.status(500).json({ error: 'An error occurred while fetching user' });
  }
};

/**
 * Get a user by username or email
 * @param req - Express request
 * @param res - Express response
 */
export const getUserByNameOrEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail } = req.body;
    const existingUser = await getUserByNameOrEmail(usernameOrEmail);

    if (existingUser) {
      res.status(200).json(existingUser);
    } else {
      res.status(200).json({ error: 'Unable to fetch user' });
    }
  } catch (error) {
    handleErrors('Error fetching user:', error as Error);
    res.status(500).json({ error: 'An error occurred while fetching user' });
  }
};
