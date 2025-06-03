import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { createNode } from './createNode';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  NODE_TABLE: 'nodes',
  GRAPH_TABLE: 'graphs',
  supabaseClient: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('createNode', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNode: FyloNode = {
    id: 'node-123',
    graph_id: 'graph-456',
    type: 'default',
    position: { x: 100, y: 200 },
    created_at: new Date().toISOString(),
    data: {
      id: 'data-123',
      description: 'Test Description',
      node_type: 'text',
      is_moving: false,
      picker_color: '#FF0000',
      is_root: false,
      document_content: 'Test Content',
      comments: [],
      confidence_score: 0.95,
    },
  };

  it('should successfully create a node and update graph node count', async () => {
    // Mock successful node creation
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNode,
            error: null,
          }),
        };
      } else if (table === GRAPH_TABLE) {
        const mockSelectChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { node_count: 5 },
            error: null,
          }),
        };

        const mockUpdateChain = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        };

        return {
          ...mockSelectChain,
          update: jest.fn().mockReturnValue(mockUpdateChain),
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Execute the function
    const result = await createNode(mockNode);

    // Assertions
    expect(result).toEqual(mockNode);
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle error during node creation', async () => {
    // Mock node creation error
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to create node'),
          }),
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Execute the function
    const result = await createNode(mockNode);

    // Assertions
    expect(result).toBeUndefined();
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
  });

  it('should handle error when fetching graph data', async () => {
    // Mock successful node creation but graph fetch error
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNode,
            error: null,
          }),
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch graph'),
          }),
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Execute the function
    const result = await createNode(mockNode);

    // Assertions
    expect(result).toBeUndefined();
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
  });

  it('should handle error when updating graph node count', async () => {
    // Mock successful node creation, successful graph fetch, but error on update
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNode,
            error: null,
          }),
        };
      } else if (table === GRAPH_TABLE) {
        const selectChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { node_count: 5 },
            error: null,
          }),
        };

        const updateChain = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: new Error('Failed to update graph'),
          }),
        };

        return {
          ...selectChain,
          update: jest.fn().mockReturnValue(updateChain),
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Execute the function
    const result = await createNode(mockNode);

    // Assertions
    expect(result).toBeUndefined();
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
  });

  it('should handle null node_count in graph data', async () => {
    // Clean setup
    jest.clearAllMocks();

    // Setup direct spies on supabase methods to track calls
    const mockNodeInsert = jest.fn().mockReturnThis();
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSingle = jest.fn().mockResolvedValue({
      data: mockNode,
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphEq = jest.fn().mockReturnThis();
    const mockGraphSingle = jest.fn().mockResolvedValue({
      data: { node_count: null },
      error: null,
    });

    const mockGraphUpdate = jest.fn().mockReturnThis();
    const mockGraphUpdateEq = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain in a way we can directly inspect the update call
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          insert: mockNodeInsert,
          select: mockNodeSelect,
          single: mockNodeSingle,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
          eq: mockGraphEq,
          single: mockGraphSingle,
          update: mockGraphUpdate,
        };
      }
      return {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockGraphUpdate.mockReturnValue({ eq: mockGraphUpdateEq });

    // Execute the function
    const result = await createNode(mockNode);

    // Assertions
    expect(result).toEqual(mockNode);
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);

    // Verify the update was called with the correct value
    expect(mockGraphUpdate).toHaveBeenCalled();
    expect(mockGraphUpdate).toHaveBeenCalledWith({ node_count: 1 });
  });
});
