import { Request, Response } from 'express';

import { GraphType } from '../consts';
import { deleteEdgesByIds } from '../database/edge/deleteEdgesByIds/deleteEdgesByIds';
import { readEdgesByNodeId } from '../database/edge/readEdgesByNodeId/readEdgesByNodeId';
import { readGraphById } from '../database/graph/readGraphById/readGraphById';
import { createNode } from '../database/node/createNode/createNode';
import { deleteNode } from '../database/node/deleteNode/deleteNode';
import { readNodesByGraphId } from '../database/node/readNodesByGraphId/readNodesByGraphId';
import { readNodesByNodeId } from '../database/node/readNodesByNodeId/readNodesByNodeId';
import { saveNodePositions } from '../database/node/saveNodePositions/saveNodePositions';
import { updateNode } from '../database/node/updateNode/updateNode';
import { handleErrors } from '../utils/errorHandler';

/**
 * Handler for creating a node
 * @param req - Express request
 * @param res - Express response
 */
export const createNodeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (!data) {
      res.status(400).json({ error: 'Node data is required' });
      return;
    }

    const createdNode = await createNode(data);

    if (createdNode) {
      res.status(201).json({ node: createdNode });
    } else {
      res.status(400).json({ error: 'Unable to create Node' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler for deleting a node
 * @param req - Express request
 * @param res - Express response
 */
export const deleteNodeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Node ID is required' });
      return;
    }

    // Fetch node data
    const nodeData = await readNodesByNodeId(id);
    if (!nodeData) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }
    const graphDetails = await readGraphById(nodeData.graph_id);
    if (!graphDetails) {
      res.status(404).json({ error: 'Graph not found' });
      return;
    }
    if (graphDetails.type === GraphType.PUBLIC) {
      res.status(403).json({ error: 'Unauthorized to delete this node' });
      return;
    }
    // Fetch and delete related edges
    const edgeData = await readEdgesByNodeId(id);
    if (edgeData?.length) {
      const edgeIds = edgeData.map((edge) => edge.id);
      await deleteEdgesByIds(edgeIds);
    }

    // Delete the node itself
    await deleteNode(nodeData.id);

    res.status(200).json({
      graphId: nodeData.graph_id,
      refrencedGraphId: graphDetails?.source_graph_id ?? null,
      message: 'Node deleted successfully!',
    });
  } catch (error) {
    handleErrors('Error deleting node:', error as Error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handler for fetching nodes by graph ID
 * @param req - Express request
 * @param res - Express response
 */
export const getNodesByGraphIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { graphId } = req.params;

    if (!graphId) {
      res.status(400).json({ error: 'Graph ID is required' });
      return;
    }

    const nodes = await readNodesByGraphId(graphId);

    if (nodes) {
      res.status(200).json({ nodes });
    } else {
      res.status(400).json({ error: 'Unable to fetch Nodes' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler for saving node positions by node IDs
 * @param req - Express request
 * @param res - Express response
 */
export const saveNodePositionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nodes } = req.body;

    if (!nodes) {
      res.status(400).json({ error: 'Node Position data is required' });
      return;
    }

    await saveNodePositions(nodes);

    res.status(200).json({ message: 'Nodes Positions updated' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler for updating a node
 * @param req - Express request
 * @param res - Express response
 */
export const updateNodeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    if (!data) {
      res.status(400).json({ error: 'Node data is required' });
      return;
    }

    const updatedNode = await updateNode(data);

    if (updatedNode) {
      res.status(200).json({ node: updatedNode });
    } else {
      res.status(400).json({ error: 'Unable to update Node' });
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

/**
 * Handler for updating node data for the conference
 * @param req - Express request
 * @param res - Express response
 */
export const updateNodeHandlerConference = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      res.status(400).json({ error: 'Node ID is required' });
      return;
    }
    if (!data) {
      res.status(400).json({ error: 'Node data is required' });
      return;
    }

    const nodeData = await readNodesByNodeId(id);
    if (!nodeData) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }

    const graphDetails = await readGraphById(nodeData.graph_id);
    if (!graphDetails) {
      res.status(404).json({ error: 'Graph not found' });
      return;
    }
    if (graphDetails.type === GraphType.PUBLIC) {
      res.status(403).json({ error: 'Unauthorized to update this node' });
      return;
    }

    const updatedNode = await updateNode({ ...data, id: nodeData.id });
    if (!updatedNode) {
      res.status(400).json({ error: 'Unable to update node' });
      return;
    }

    res.status(200).json({ node: updatedNode, message: 'Node updated successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
