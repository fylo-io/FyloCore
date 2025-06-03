import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { updateEdge } from './updateEdge';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('updateEdge', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update an edge', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-456',
      type: 'relationship',
      source: 'node-789',
      target: 'node-012',
      data: {
        label: 'Updated Connection',
        description: 'Updated description of the connection',
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
      created_at: new Date(),
    };

    // Create mock functions for the chain
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockEdge,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await updateEdge(mockEdge);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);

    // Verify update was called with correct edge data
    expect(mockUpdate).toHaveBeenCalledWith({ ...mockEdge });

    // Verify eq was called with correct id
    expect(mockEq).toHaveBeenCalledWith('id', mockEdge.id);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify single was called
    expect(mockSingle).toHaveBeenCalled();

    // Verify the result matches our mock edge
    expect(result).toEqual(mockEdge);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle when edge is not found', async () => {
    // Mock edge data with non-existent ID
    const mockEdge: FyloEdge = {
      id: 'nonexistent-edge-123',
      graph_id: 'graph-456',
      type: 'relationship',
      source: 'node-789',
      target: 'node-012',
      data: {
        label: 'Test Label',
        description: 'Test Description',
      },
    };

    // Mock error for no results
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await updateEdge(mockEdge);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle database errors properly', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-456',
      type: 'relationship',
      source: 'node-789',
      target: 'node-012',
      data: {
        label: 'Test Label',
        description: 'Test Description',
      },
    };

    // Mock database error
    const mockError = new Error('Database connection error');

    // Create mock functions for the chain
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await updateEdge(mockEdge);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-456',
      type: 'relationship',
      source: 'node-789',
      target: 'node-012',
      data: {
        label: 'Test Label',
        description: 'Test Description',
      },
    };

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await updateEdge(mockEdge);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the exception
    expect(result).toBeUndefined();
  });

  it('should handle edge update with optional comments', async () => {
    // Mock edge data without comments
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-456',
      type: 'relationship',
      source: 'node-789',
      target: 'node-012',
      data: {
        label: 'Test Label',
        description: 'Test Description',
        // comments field omitted
      },
    };

    // Create mock functions for the chain
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockEdge,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await updateEdge(mockEdge);

    // Verify update was called with correct edge data
    expect(mockUpdate).toHaveBeenCalledWith({ ...mockEdge });

    // Verify the result matches our mock edge
    expect(result).toEqual(mockEdge);
    expect(result?.data.comments).toBeUndefined();
  });
});
