import { UserProfile } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { USER_TABLE, pool } from '../../postgresClient';

export const readUserProfiles = async (): Promise<UserProfile[] | undefined> => {
  try {
    const query = `SELECT id, name, profile_color FROM ${USER_TABLE}`;
    const result = await pool.query(query);

    return result.rows as UserProfile[];
  } catch (error) {
    handleErrors('PostgreSQL Error:', error as Error);
  }
};
