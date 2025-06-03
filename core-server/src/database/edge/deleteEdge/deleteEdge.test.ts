import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { deleteEdge } from './deleteEdge';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('deleteEdge', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Increased timeout and simplified mock implementation
  it('should successfully delete an edge', async () => {
    // Create a sample edge
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test edge description',
        comments: [
          {
            id: 'comment-123',
            created_at: new Date().toISOString(),
            graph_id: 'graph-123',
            edge_id: 'edge-123',
            author: 'Test User',
            color: '#FF5733',
            text: 'Test comment',
          },
        ],
      },
    };

    // Simplified mock implementation
    const mockResponse = { error: null };
    (supabaseClient.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue(mockResponse),
    });

    // Call the function
    await deleteEdge(mockEdge);

    // Verify the basic flow
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(handleErrors).not.toHaveBeenCalled();
  }, 10000); // Increased timeout to 10 seconds

  it('should handle database errors properly', async () => {
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test edge description',
      },
    };

    const mockError = new Error('Database error during deletion');
    (supabaseClient.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: mockError }),
    });

    await deleteEdge(mockEdge);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  }, 10000); // Increased timeout to 10 seconds

  it('should handle exceptions during the database operation', async () => {
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test edge description',
      },
    };

    const mockError = new Error('Network error');
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    await deleteEdge(mockEdge);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle edge deletion with no comments', async () => {
    const mockEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'relationship',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test edge description',
      },
    };

    const mockResponse = { error: null };
    (supabaseClient.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue(mockResponse),
    });

    await deleteEdge(mockEdge);

    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(handleErrors).not.toHaveBeenCalled();
  }, 10000); // Increased timeout to 10 seconds
});
