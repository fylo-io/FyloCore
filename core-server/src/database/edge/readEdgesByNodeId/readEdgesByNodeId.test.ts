import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { readEdgesByNodeId } from './readEdgesByNodeId';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readEdgesByNodeId', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve edges for a node as source or target', async () => {
    // Test node ID
    const nodeId = 'test-node-123';

    // Mock edges that should be returned
    const mockEdges: FyloEdge[] = [
      {
        id: 'edge-1',
        created_at: new Date(),
        graph_id: 'graph-123',
        type: 'default',
        source: nodeId,
        target: 'other-node-1',
        data: {
          label: 'Connects to 1',
          description: 'Edge description 1',
        },
      },
      {
        id: 'edge-2',
        created_at: new Date(),
        graph_id: 'graph-123',
        type: 'default',
        source: 'other-node-2',
        target: nodeId,
        data: {
          label: 'Connects to 2',
          description: 'Edge description 2',
          comments: [
            {
              id: 'comment-1',
              created_at: 'first-date',
              graph_id: 'first-graph',
              author: 'first-author',
              color: 'first-color',
              text: 'First comment',
            },
          ],
        },
      },
    ];

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: mockEdges,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readEdgesByNodeId(nodeId);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify or was called with correct arguments
    expect(mockOr).toHaveBeenCalledWith(`source.eq.${nodeId},target.eq.${nodeId}`);

    // Verify the result matches our mock edges
    expect(result).toEqual(mockEdges);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return empty array when no edges are found', async () => {
    // Test node ID with no edges
    const nodeId = 'node-without-edges';

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readEdgesByNodeId(nodeId);

    // Verify the result is an empty array
    expect(result).toEqual([]);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    // Test node ID
    const nodeId = 'test-node-123';

    // Mock database error
    const mockError = new Error('Database connection error');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readEdgesByNodeId(nodeId);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Test node ID
    const nodeId = 'test-node-123';

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await readEdgesByNodeId(nodeId);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the exception
    expect(result).toBeUndefined();
  });

  it('should handle edges with comments properly', async () => {
    // Test node ID
    const nodeId = 'test-node-123';

    // Mock edge with comments
    const mockEdgeWithComments: FyloEdge = {
      id: 'edge-with-comments',
      created_at: new Date(),
      graph_id: 'graph-123',
      type: 'default',
      source: nodeId,
      target: 'other-node',
      data: {
        label: 'Edge with comments',
        description: 'Edge description',
        comments: [
          {
            id: 'comment-1',
            created_at: 'first-date',
            graph_id: 'first-graph',
            author: 'first-author',
            color: 'first-color',
            text: 'First comment',
          },
          {
            id: 'comment-2',
            created_at: 'second-date',
            graph_id: 'second-graph',
            author: 'second-author',
            color: 'second-color',
            text: 'Second comment',
          },
        ],
      },
    };

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: [mockEdgeWithComments],
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readEdgesByNodeId(nodeId);

    // Verify the result includes the edge with comments
    expect(result).toEqual([mockEdgeWithComments]);
    expect(result?.[0].data.comments?.length).toBe(2);
    expect(result?.[0].data.comments?.[0].text).toBe('First comment');
  });
});
