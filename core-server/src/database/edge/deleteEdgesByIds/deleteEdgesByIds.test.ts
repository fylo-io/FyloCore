import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { deleteEdgesByIds } from './deleteEdgesByIds';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('deleteEdgesByIds', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete multiple edges', async () => {
    // Test edge IDs
    const edgeIds = ['edge-1', 'edge-2', 'edge-3'];

    // Create mock functions for the chain
    const mockDelete = jest.fn().mockReturnThis();
    const mockIn = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      delete: mockDelete,
      in: mockIn,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    await deleteEdgesByIds(edgeIds);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);

    // Verify delete was called
    expect(mockDelete).toHaveBeenCalled();

    // Verify in was called with correct arguments
    expect(mockIn).toHaveBeenCalledWith('id', edgeIds);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should do nothing when empty array is provided', async () => {
    // Call the function with empty array
    await deleteEdgesByIds([]);

    // Verify that no database calls were made
    expect(supabaseClient.from).not.toHaveBeenCalled();

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    // Test edge IDs
    const edgeIds = ['edge-1', 'edge-2'];

    // Mock database error
    const mockError = new Error('Database connection error');

    // Create mock functions for the chain
    const mockDelete = jest.fn().mockReturnThis();
    const mockIn = jest.fn().mockResolvedValue({
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      delete: mockDelete,
      in: mockIn,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    await deleteEdgesByIds(edgeIds);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle exceptions during the database operation', async () => {
    // Test edge IDs
    const edgeIds = ['edge-1', 'edge-2'];

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    await deleteEdgesByIds(edgeIds);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle deletion of edges with complex data', async () => {
    // Test edge with full FyloEdge structure
    const complexEdge: FyloEdge = {
      id: 'edge-1',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Complex connection',
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
    };

    const edgeIds = [complexEdge.id];

    // Create mock functions for the chain
    const mockDelete = jest.fn().mockReturnThis();
    const mockIn = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      delete: mockDelete,
      in: mockIn,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    await deleteEdgesByIds(edgeIds);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);

    // Verify delete was called
    expect(mockDelete).toHaveBeenCalled();

    // Verify in was called with correct arguments
    expect(mockIn).toHaveBeenCalledWith('id', edgeIds);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle deletion of multiple edges with mixed validity', async () => {
    // Test edge IDs (mix of valid and potentially invalid IDs)
    const edgeIds = ['valid-edge-1', 'invalid-edge', 'valid-edge-2'];

    // Create mock functions for the chain
    const mockDelete = jest.fn().mockReturnThis();
    const mockIn = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      delete: mockDelete,
      in: mockIn,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    await deleteEdgesByIds(edgeIds);

    // Verify the function processes all IDs
    expect(mockIn).toHaveBeenCalledWith('id', edgeIds);

    // Verify error handler was not called (as Supabase handles non-existent IDs gracefully)
    expect(handleErrors).not.toHaveBeenCalled();
  });
});
