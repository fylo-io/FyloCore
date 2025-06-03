import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { createEdge } from './createEdge';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('createEdge', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create an edge', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Basic connection between nodes',
        comments: [],
      },
    };

    // Create mock functions for the chain
    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockEdge,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await createEdge(mockEdge);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);

    // Verify insert was called with correct data
    expect(mockInsert).toHaveBeenCalledWith([{ ...mockEdge }]);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify single was called
    expect(mockSingle).toHaveBeenCalled();

    // Verify the result matches our mock edge
    expect(result).toEqual(mockEdge);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should create an edge with comments', async () => {
    // Mock edge data with comments
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Connection with comments',
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
    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockEdge,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    const result = await createEdge(mockEdge);

    expect(mockInsert).toHaveBeenCalledWith([{ ...mockEdge }]);
    expect(result).toEqual(mockEdge);
    expect(result?.data.comments?.length).toBe(2);
  });

  it('should handle database errors properly', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Test connection',
      },
    };

    // Mock database error
    const mockError = new Error('Database error');

    // Create mock functions for the chain
    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    const result = await createEdge(mockEdge);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Mock edge data
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Test connection',
      },
    };

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await createEdge(mockEdge);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle edge creation with created_at field', async () => {
    // Mock edge data with created_at
    const createdAt = new Date();
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      created_at: createdAt,
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'connects to',
        description: 'Test connection with timestamp',
      },
    };

    // Create mock functions for the chain
    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockEdge,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    const result = await createEdge(mockEdge);

    expect(mockInsert).toHaveBeenCalledWith([{ ...mockEdge }]);
    expect(result).toEqual(mockEdge);
    expect(result?.created_at).toEqual(createdAt);
  });
});
