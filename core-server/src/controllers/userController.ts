import { Request, Response } from 'express';

import { readGraphById } from '../database/graph/readGraphById/readGraphById';
import { readSharedUserIds } from '../database/share/readSharedUserIds/readSharedUserIds';
import { uploadAvatar } from '../database/storageService';
import { readUserById } from '../database/user/readUserById/readUserById';
import { readUserProfiles } from '../database/user/readUserProfiles/readUserProfiles';
import { updateUserProfile } from '../database/user/updateUserProfile/updateUserProfile';

/**
 * Get available usernames for sharing
 * @param req - Express request
 * @param res - Express response
 */
export const getAvailableUsernamesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { graphId } = req.query;

    if (!graphId) {
      res.status(400).json({ error: 'Graph ID is required' });
      return;
    }

    const userProfiles = await readUserProfiles();
    const graph = await readGraphById(graphId as string);
    const sharedUserIds = await readSharedUserIds(graphId as string);

    const usernames = userProfiles
      ?.filter(
        (userProfile) =>
          userProfile.id !== graph?.creator_id && !sharedUserIds?.includes(userProfile.id),
      )
      .map((userProfile) => userProfile.name);

    res.status(200).json({ usernames });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Get user by ID
 * @param req - Express request
 * @param res - Express response
 */
export const getUserByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    const user = await readUserById(userId as string);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(400).json({ error: 'Unable to fetch User' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Update user profile (avatar and profile color)
 * @param req - Express request
 * @param res - Express response
 */
export const updateUserProfileHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, profileColor } = req.body;
    const avatar = req.file;

    if (!userId || !profileColor) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    let avatarUrl = null;

    if (avatar) {
      // Upload avatar to storage
      const uploadResult = await uploadAvatar(
        userId,
        avatar.buffer,
        avatar.originalname,
        avatar.mimetype,
      );

      if (!uploadResult.success) {
        throw new Error(`Failed to upload avatar: ${uploadResult.error}`);
      }

      avatarUrl = uploadResult.url;
    }

    // Update user profile in database
    const updateResult = await updateUserProfile(userId, profileColor, avatarUrl);

    if (!updateResult.success) {
      throw new Error(updateResult.error || 'Failed to update user profile');
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updateResult.data,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
