import { UserType } from '../consts';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserType:
 *       type: string
 *       enum: [ADMIN, USER, GOOGLE]
 *       description: Type of user account
 *
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - created_at
 *         - name
 *         - email
 *         - type
 *         - verified
 *         - profile_color
 *       properties:
 *         id:
 *           type: string
 *           description: The user's unique identifier
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *         name:
 *           type: string
 *           description: The user's display name or username
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         password:
 *           type: string
 *           description: The user's password (hashed, not returned in responses)
 *         type:
 *           $ref: '#/components/schemas/UserType'
 *         verified:
 *           type: boolean
 *           description: Whether the user's email has been verified
 *         profile_color:
 *           type: string
 *           description: The user's chosen profile color (hex code)
 *         avatar_url:
 *           type: string
 *           description: URL to the user's avatar image
 *
 *     UserProfile:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - profile_color
 *       properties:
 *         id:
 *           type: string
 *           description: The user's unique identifier
 *         name:
 *           type: string
 *           description: The user's display name or username
 *         profile_color:
 *           type: string
 *           description: The user's chosen profile color (hex code)
 */

export interface User {
  id: string;
  created_at: Date | string;
  name: string;
  email: string;
  password?: string;
  type: UserType;
  verified: boolean;
  profile_color: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  profile_color: string;
}
