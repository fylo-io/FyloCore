import { Request, Response } from 'express';
import { GraphType } from '../consts';

import { createGraph } from '../database/graph/createGraph/createGraph';
import { deleteGraph } from '../database/graph/deleteGraph/deleteGraph';
import { getGraphContributors } from '../database/graph/getGraphContributors/getGraphContributors';
import { getNodeCountOfGraph } from '../database/graph/getNodeCountOfGraph/getNodeCountOfGraph';
import { readGraphById } from '../database/graph/readGraphById/readGraphById';
import { readPublicGraphs } from '../database/graph/readPublicGraphs/readPublicGraphs';
import { readVisibleGraphsByUserId } from '../database/graph/readVisibleGraphsByUserId/readVisibleGraphsByUserId';

/**
 * Create a new graph
 * @param req - Express request
 * @param res - Express response
 */
export const createGraphHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, creatorId, creatorName, creatorProfileColor, sourceGraphId } =
      req.body;

    if (!title || !description || !creatorId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const createdGraph = await createGraph({
      title,
      description,
      creator_id: creatorId,
      type: GraphType.PRIVATE, // Default type
      source_graph_id: sourceGraphId,
      node_count: 0,
    });

    if (createdGraph) {
      res.status(201).json({ graph: createdGraph });
    } else {
      res.status(400).json({ error: 'Unable to create Graph' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Delete a graph
 * @param req - Express request
 * @param res - Express response
 */
export const deleteGraphHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Graph ID is required' });
      return;
    }

    await deleteGraph(id);
    res.status(200).json({ message: 'Graph deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Get a graph by ID
 * @param req - Express request
 * @param res - Express response
 */
export const getGraphByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { graphId } = req.params;

    if (!graphId) {
      res.status(400).json({ error: 'Graph ID is required' });
      return;
    }

    const graph = await readGraphById(graphId);

    if (graph) {
      res.status(200).json({ graph });
    } else {
      res.status(400).json({ error: 'Unable to fetch Graph' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Get all users who can view a graph
 * @param req - Express request
 * @param res - Express response
 */
export const getGraphViewersHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { graphId } = req.params;
    const graph = await readGraphById(graphId);
    if (graph) {
      const viewers = await getGraphContributors(graph);
      if (viewers) {
        res.status(200).json({ viewers });
      } else {
        res.status(400).json({ error: 'Unable to fetch viewers' });
      }
    } else {
      res.status(400).json({ error: 'Unable to fetch graph by id' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Get all public graphs
 * @param req - Express request
 * @param res - Express response
 */
export const getPublicGraphsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const graphs = await readPublicGraphs();

    if (graphs) {
      const result = [];
      for (const graph of graphs) {
        const node_count = await getNodeCountOfGraph(graph.id);
        const contributors = await getGraphContributors(graph);
        result.push({ ...graph, node_count, contributors });
      }
      res.status(200).json({ graphs: result });
    } else {
      res.status(400).json({ error: 'Unable to fetch Visible Graphs' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Get visible graphs for a user
 * @param req - Express request
 * @param res - Express response
 */
export const getVisibleGraphsByUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const graphs = await readVisibleGraphsByUserId(userId);

    if (graphs) {
      res.status(200).json({ graphs });
    } else {
      res.status(400).json({ error: 'Unable to fetch Visible Graphs' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
