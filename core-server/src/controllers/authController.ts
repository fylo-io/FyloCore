import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { createGoogleUser } from '../database/auth/createGoogleUser/createGoogleUser';
import { createUser } from '../database/auth/createUser/createUser';
import { markEmailAsVerified } from '../database/auth/markEmailAsVerified/markEmailAsVerified';
import { readGoogleUserByEmail } from '../database/auth/readGoogleUserByEmail/readGoogleUserByEmail';
import { readUserByNameOrByEmail } from '../database/auth/readUserByNameOrByEmail/readUserByNameOrByEmail';
import { readUserByNameOrEmail } from '../database/auth/readUserByNameOrEmail/readUserByNameOrEmail';
import { sendEmail } from '../utils/email';
import { handleErrors } from '../utils/errorHandler';

/**
 * Create a new Google user
 * @param req - Express request
 * @param res - Express response
 */
export const createGoogleUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, image } = req.body;
    const existingUser = await readGoogleUserByEmail(email);
    if (existingUser) {
      res.status(200).json({ message: 'Google User already exists' });
    } else {
      const createdUser = await createGoogleUser(name, email, image);
      if (createdUser) {
        res.status(201).json(createdUser);
      } else {
        res.status(400).json({ error: 'Unable to create Google User' });
      }
    }
  } catch (error) {
    handleErrors('Error creating Google User:', error as Error);
    res.status(500).json({ error: 'An error occurred while creating Google User' });
  }
};

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
      const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: '5m',
      });

      const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;

      await sendEmail(
        'info@updates.fylo.io',
        email,
        'Verify Your Email Address',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Welcome to Fylo, ${username}!</h2>
          <p style="color: #555;">You're almost there! Please click the button below to verify your email address. The link will expire in 5 minutes.</p>
          <a href="${verificationLink}" style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="color: #777;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        `,
      );

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
 * Get a Google user by email
 * @param req - Express request
 * @param res - Express response
 */
export const readGoogleUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    if (typeof email !== 'string') {
      res.status(400).json({ error: 'Email should be a string' });
    } else {
      const existingUser = await readGoogleUserByEmail(email);
      if (existingUser) {
        res.status(200).json(existingUser);
      } else {
        res.status(400).json({ error: 'Unable to read Google User' });
      }
    }
  } catch (error) {
    handleErrors('Error reading Google User:', error as Error);
    res.status(500).json({ error: 'An error occurred while reading Google User' });
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
export const readUserByNameOrEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usernameOrEmail } = req.body;
    const existingUser = await readUserByNameOrEmail(usernameOrEmail);

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

/**
 * Verify a user's email address
 * @param req - Express request
 * @param res - Express response
 */
export const verifyEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token) {
      res.status(400).send('Invalid or missing token.');
      return;
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!);
    const email = (decoded as { email: string }).email;

    const wasVerified = await markEmailAsVerified(email);

    if (!wasVerified) {
      res.status(400).send('This email has already been verified.');
      return;
    }

    res.status(200).send(wasVerified);
  } catch (error) {
    handleErrors('Error verifying email:', error as Error);
    res.status(400).send('Invalid or expired token.');
  }
};
