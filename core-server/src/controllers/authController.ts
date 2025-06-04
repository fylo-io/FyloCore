import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

import { createGoogleUser } from '../database/auth/createGoogleUser/createGoogleUser';
import { createUser } from '../database/auth/createUser/createUser';
import { markEmailAsVerified } from '../database/auth/markEmailAsVerified/markEmailAsVerified';
import { readGoogleUserByEmail } from '../database/auth/readGoogleUserByEmail/readGoogleUserByEmail';
import { readUserByNameOrByEmail } from '../database/auth/readUserByNameOrByEmail/readUserByNameOrByEmail';
import { readUserByNameOrEmail } from '../database/auth/readUserByNameOrEmail/readUserByNameOrEmail';
import { updateUserPassword } from '../database/auth/updateUserPassword/updateUserPassword';
import { sendEmail } from '../utils/email';
import { handleErrors } from '../utils/errorHandler';

// In-memory storage for password reset tokens
interface ResetToken {
  userId: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

const resetTokens = new Map<string, ResetToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expiresAt) {
      resetTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

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

/**
 * Send a password reset email
 * @param req - Express request
 * @param res - Express response
 */
export const sendPasswordResetEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await readUserByNameOrEmail(email);
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    resetTokens.set(token, { userId: user.id, email, createdAt: new Date(), expiresAt });

    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    await sendEmail(
      'info@updates.fylo.io',
      email,
      'Reset Your Password',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #555;">You're receiving this email because you requested a password reset for your account.</p>
          <p style="color: #555;">Please click the button below to reset your password. The link will expire in 30 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #777;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        `,
    );

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    handleErrors('Error sending password reset email:', error as Error);
    res.status(500).json({ error: 'An error occurred while sending password reset email' });
  }
};

/**
 * Reset a user's password
 * @param req - Express request
 * @param res - Express response
 */
export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    const resetToken = resetTokens.get(token);
    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const user = await readUserByNameOrEmail(resetToken.email);
    if (!user) {
      res.status(400).json({ error: 'User not found' });
      return;
    }

    // Password comes pre-hashed from NextAuth API
    const updateResult = await updateUserPassword(user.id, password);
    
    if (!updateResult) {
      console.error('Failed to update user password for user ID:', user.id);
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    resetTokens.delete(token);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    handleErrors('Error resetting password:', error as Error);
    res.status(500).json({ error: 'An error occurred while resetting password' });
  }
};

/**
 * Validate a password reset token
 * @param req - Express request
 * @param res - Express response
 */
export const validateResetTokenHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;
    const resetToken = resetTokens.get(token as string);
    
    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const now = new Date();
    if (now > resetToken.expiresAt) {
      resetTokens.delete(token as string);
      res.status(400).json({ error: 'Token has expired' });
      return;
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    handleErrors('Error validating reset token:', error as Error);
    res.status(500).json({ error: 'An error occurred while validating token' });
  }
};
