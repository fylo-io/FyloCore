import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { updateNodeData } from './updateNodeData';

// Define a proper type for the newData to match FyloNode's data structure
type NodeData = {
  id: string;
  description?: string;
  node_type?: string;
  is_moving?: boolean;
  picker_color?: string;
  is_root?: boolean;
  document_content?: string;
  label?: string;
  position?: { x: number; y: number };
};

// Mock the dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        filter: jest.fn(() => ({
          filter: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(),
          })),
        })),
      })),
    })),
  },
  NODE_TABLE: 'nodes',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('updateNodeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update node data when node exists', async () => {
    // Mock data
    const nodeId = 'test-node-id';
    const graphId = 'test-graph-id';
    const existingNodeData: NodeData = {
      id: nodeId,
      label: 'Old Label',
      position: { x: 0, y: 0 },
    };
    const existingNode = { id: nodeId, graph_id: graphId, data: existingNodeData };
    const newData: Partial<NodeData> = { label: 'New Label' };
    const updatedData = { id: nodeId, label: 'New Label', position: { x: 0, y: 0 } };
    const updatedNode = { id: nodeId, graph_id: graphId, data: updatedData };

    // Setup mock implementations
    const selectMock = jest.fn(() => ({
      filter: jest.fn(() => ({
        filter: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: existingNode,
            error: null,
          }),
        })),
      })),
    }));

    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: [updatedNode],
            error: null,
          }),
        })),
      })),
    }));

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === NODE_TABLE) {
        return {
          select: selectMock,
          update: updateMock,
        };
      }
      return {};
    });

    // Call the function
    const result = await updateNodeData(nodeId, graphId, newData);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(updateMock).toHaveBeenCalledWith({ data: updatedData });
    expect(result).toEqual([updatedNode]);
  });

  it('should handle case when node is not found', async () => {
    // Mock data
    const nodeId = 'non-existent-node';
    const graphId = 'test-graph-id';
    const newData: Partial<NodeData> = { label: 'New Label' };

    // Setup mock implementations
    const selectMock = jest.fn(() => ({
      filter: jest.fn(() => ({
        filter: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        })),
      })),
    }));

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === NODE_TABLE) {
        return {
          select: selectMock,
        };
      }
      return {};
    });

    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Call the function
    const result = await updateNodeData(nodeId, graphId, newData);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `Node with id: ${nodeId} and graphId: ${graphId} not found.`,
    );
    expect(result).toBeUndefined();

    consoleWarnSpy.mockRestore();
  });

  it('should handle fetch error', async () => {
    // Mock data
    const nodeId = 'test-node-id';
    const graphId = 'test-graph-id';
    const newData: Partial<NodeData> = { label: 'New Label' };
    const fetchError = new Error('Database fetch error');

    // Setup mock implementations
    const selectMock = jest.fn(() => ({
      filter: jest.fn(() => ({
        filter: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: fetchError,
          }),
        })),
      })),
    }));

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === NODE_TABLE) {
        return {
          select: selectMock,
        };
      }
      return {};
    });

    // Call the function - changed from expecting a throw
    const result = await updateNodeData(nodeId, graphId, newData);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(handleErrors).toHaveBeenCalledWith('Error fetching node data:', fetchError);
    expect(result).toBeUndefined();
  });

  it('should handle update error', async () => {
    // Mock data
    const nodeId = 'test-node-id';
    const graphId = 'test-graph-id';
    const existingNodeData: NodeData = {
      id: nodeId,
      label: 'Old Label',
      position: { x: 0, y: 0 },
    };
    const existingNode = { id: nodeId, graph_id: graphId, data: existingNodeData };
    const newData: Partial<NodeData> = { label: 'New Label' };
    const updateError = new Error('Database update error');

    // Setup mock implementations
    const selectMock = jest.fn(() => ({
      filter: jest.fn(() => ({
        filter: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: existingNode,
            error: null,
          }),
        })),
      })),
    }));

    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: updateError,
          }),
        })),
      })),
    }));

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === NODE_TABLE) {
        return {
          select: selectMock,
          update: updateMock,
        };
      }
      return {};
    });

    // Call the function
    await updateNodeData(nodeId, graphId, newData);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', updateError);
  });
});
