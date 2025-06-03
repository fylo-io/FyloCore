import { Comment } from '../../../types/comment';
import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { addCommentToEdge } from './addCommentToEdge';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('addCommentToEdge', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully add a first comment to an edge', async () => {
    // Test data
    const newComment: Comment = {
      id: 'comment-1',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'edge-123',
      author: 'Test User',
      color: '#FF5733',
      text: 'Test comment',
    };

    const existingEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'default',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test description',
        // No comments array yet
      },
    };

    const expectedUpdatedEdge: FyloEdge = {
      ...existingEdge,
      data: {
        ...existingEdge.data,
        comments: [newComment],
      },
    };

    // Mock the fetch query
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: existingEdge,
          error: null,
        }),
      }),
    });

    // Mock the update query
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: expectedUpdatedEdge,
            error: null,
          }),
        }),
      }),
    });

    // Setup the from mock to return different implementations based on method called
    (supabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: mockSelect,
      update: mockUpdate,
    }));

    // Call the function
    const result = await addCommentToEdge(newComment);

    // Verify the calls
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(result).toEqual(expectedUpdatedEdge);
    expect(result?.data.comments).toHaveLength(1);
    expect(result?.data.comments?.[0]).toEqual(newComment);
  });

  it('should successfully add a comment to an edge with existing comments', async () => {
    const existingComment: Comment = {
      id: 'existing-comment',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'edge-123',
      author: 'Previous User',
      color: '#33FF57',
      text: 'Existing comment',
    };

    const newComment: Comment = {
      id: 'new-comment',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'edge-123',
      author: 'Test User',
      color: '#FF5733',
      text: 'New comment',
    };

    const existingEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'default',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test description',
        comments: [existingComment],
      },
    };

    const expectedUpdatedEdge: FyloEdge = {
      ...existingEdge,
      data: {
        ...existingEdge.data,
        comments: [existingComment, newComment],
      },
    };

    // Mock implementations
    (supabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: existingEdge,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expectedUpdatedEdge,
              error: null,
            }),
          }),
        }),
      }),
    }));

    const result = await addCommentToEdge(newComment);

    expect(result?.data.comments).toHaveLength(2);
    expect(result?.data.comments).toContainEqual(existingComment);
    expect(result?.data.comments).toContainEqual(newComment);
  });

  it('should handle edge not found error', async () => {
    const newComment: Comment = {
      id: 'comment-1',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'nonexistent-edge',
      author: 'Test User',
      color: '#FF5733',
      text: 'Test comment',
    };

    const mockError = new Error('Edge not found');

    // Mock implementation for edge not found
    (supabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    }));

    const result = await addCommentToEdge(newComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle update error', async () => {
    const newComment: Comment = {
      id: 'comment-1',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'edge-123',
      author: 'Test User',
      color: '#FF5733',
      text: 'Test comment',
    };

    const existingEdge: FyloEdge = {
      id: 'edge-123',
      graph_id: 'graph-123',
      type: 'default',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Test Edge',
        description: 'Test description',
      },
    };

    const mockUpdateError = new Error('Update failed');

    // Mock implementations
    (supabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: existingEdge,
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockUpdateError,
            }),
          }),
        }),
      }),
    }));

    const result = await addCommentToEdge(newComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockUpdateError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected errors during execution', async () => {
    const newComment: Comment = {
      id: 'comment-1',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      edge_id: 'edge-123',
      author: 'Test User',
      color: '#FF5733',
      text: 'Test comment',
    };

    const mockError = new Error('Unexpected error');

    // Mock implementation to throw error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await addCommentToEdge(newComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });
});
