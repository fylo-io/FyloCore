import { Request, Response } from 'express';

import { createEdge } from '../database/edge/createEdge/createEdge';
import { isConnected } from '../database/edge/isConnected/isConnected';
import { readEdgesByGraphId } from '../database/edge/readEdgesByGraphId/readEdgesByGraphId';
import { handleErrors } from '../utils/errorHandler';

/**
 * Check if two nodes are connected
 * @param req - Express request containing source and target node IDs
 * @param res - Express response
 */
export const checkIfConnectedHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { source, target } = req.body;

    if (!source || !target) {
      res.status(400).json({ error: 'Source and target are required' });
      return;
    }

    const connected = await isConnected(source, target);
    res.status(200).json({ connected });
  } catch (error) {
    handleErrors('Error checking connection:', error as Error);
    res.status(500).json({ error: 'An error occurred while checking connection' });
  }
};

/**
 * Create a new edge between nodes
 * @param req - Express request containing edge data
 * @param res - Express response
 */
export const createNewEdgeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (!data) {
      res.status(400).json({ error: 'Edge data is required' });
      return;
    }

    const createdEdge = await createEdge(data);

    if (createdEdge) {
      res.status(201).json({ edge: createdEdge });
    } else {
      res.status(400).json({ error: 'Unable to create edge' });
    }
  } catch (error) {
    handleErrors('Error creating edge:', error as Error);
    res.status(500).json({ error: 'An error occurred while creating edge' });
  }
};

/**
 * Fetch all edges for a specific graph
 * @param req - Express request containing graph ID in params
 * @param res - Express response
 */
export const getEdgesByGraphIdHandler = async (req: Request, res: Response): Promise<void> => {
  const { graphId } = req.params;

  try {
    const edges = await readEdgesByGraphId(graphId);

    if (edges) {
      res.status(200).json({ edges });
    } else {
      res.status(400).json({ error: 'Unable to fetch edges' });
    }
  } catch (error) {
    handleErrors('Error fetching edges:', error as Error);
    res.status(500).json({ error: 'An error occurred while fetching edges' });
  }
};
