import { User } from '../../../types/user';
import { GRAPH_TABLE, SHARE_TABLE, pool } from '../../postgresClient';

export const createShare = async (graphId: string, user: User): Promise<void> => {
  try {
    const query = `
      INSERT INTO ${SHARE_TABLE} (graph_id, user_id, created_at)
      VALUES ($1, $2, $3)
    `;
    const values = [
      graphId,
      user.id,
      new Date().toISOString()
    ];
    
    await pool.query(query, values);

    // Get graph contributors using raw SQL
    const graphResult = await pool.query(
      `SELECT contributors FROM ${GRAPH_TABLE} WHERE id = $1`,
      [graphId]
    );

    if (graphResult.rows.length === 0) {
      throw new Error('Graph not found');
    }

    const graphData = graphResult.rows[0];
    const newContributor = {
      name: user.name || user.name,
      profile_color: user.profile_color,
    };

    const currentContributors = graphData?.contributors || [];

    const contributorExists = currentContributors.some(
      (contributor: { name: string }) => contributor.name === newContributor.name,
    );

    if (!contributorExists) {
      const updatedContributors = [...currentContributors, newContributor];

      // Update contributors using raw SQL
      await pool.query(
        `UPDATE ${GRAPH_TABLE} SET contributors = $1 WHERE id = $2`,
        [JSON.stringify(updatedContributors), graphId]
      );
    }
  } catch (error) {
    console.error('Error creating share:', error);
    throw error;
  }
};
