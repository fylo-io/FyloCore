import { Comment } from '../../../types/comment';
import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { addCommentToNode } from './addCommentToNode';

jest.mock('../../supabaseClient', () => ({
  NODE_TABLE: 'nodes',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('addCommentToNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockComment: Comment = {
    id: 'comment-1',
    created_at: new Date().toISOString(),
    graph_id: 'graph-123',
    node_id: 'node-123',
    author: 'Test User',
    color: '#FF5733',
    text: 'Test comment',
  };

  const mockNode: FyloNode = {
    id: 'node-123',
    created_at: new Date().toISOString(),
    graph_id: 'graph-123',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      id: 'node-123',
      description: 'Test node',
      node_type: 'default',
      comments: [],
    },
  };

  it('should successfully add a comment to a node with no existing comments', async () => {
    // Mock the fetch response
    const mockFetchResponse = {
      data: mockNode,
      error: null,
    };

    // Mock the update response with the new comment added
    const mockUpdatedNode: FyloNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        comments: [mockComment],
      },
    };

    const mockUpdateResponse = {
      data: mockUpdatedNode,
      error: null,
    };

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValueOnce(mockFetchResponse)
        .mockResolvedValueOnce(mockUpdateResponse),
    });

    const result = await addCommentToNode(mockComment);

    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(result).toEqual(mockUpdatedNode);
    expect(result?.data.comments).toHaveLength(1);
    expect(result?.data.comments?.[0]).toEqual(mockComment);
  });

  it('should successfully add a comment to a node with existing comments', async () => {
    const existingComment: Comment = {
      id: 'existing-comment',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      node_id: 'node-123',
      author: 'Previous User',
      color: '#33FF57',
      text: 'Existing comment',
    };

    const nodeWithExistingComment: FyloNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        comments: [existingComment],
      },
    };

    // Mock the fetch response
    const mockFetchResponse = {
      data: nodeWithExistingComment,
      error: null,
    };

    // Mock the update response with both comments
    const mockUpdatedNode: FyloNode = {
      ...nodeWithExistingComment,
      data: {
        ...nodeWithExistingComment.data,
        comments: [existingComment, mockComment],
      },
    };

    const mockUpdateResponse = {
      data: mockUpdatedNode,
      error: null,
    };

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValueOnce(mockFetchResponse)
        .mockResolvedValueOnce(mockUpdateResponse),
    });

    const result = await addCommentToNode(mockComment);

    expect(result?.data.comments).toHaveLength(2);
    expect(result?.data.comments).toContainEqual(existingComment);
    expect(result?.data.comments).toContainEqual(mockComment);
  });

  it('should handle fetch error properly', async () => {
    const mockError = new Error('Failed to fetch node');

    // Setup the mock implementation with fetch error
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    const result = await addCommentToNode(mockComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle update error properly', async () => {
    // Mock successful fetch
    const mockFetchResponse = {
      data: mockNode,
      error: null,
    };

    // Mock update error
    const mockError = new Error('Failed to update node');

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce(mockFetchResponse).mockResolvedValueOnce({
        data: null,
        error: mockError,
      }),
    });

    const result = await addCommentToNode(mockComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle node not found', async () => {
    const mockError = new Error('Node not found');

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    const result = await addCommentToNode(mockComment);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected data structure', async () => {
    // Mock malformed node data
    const malformedNode = {
      id: 'node-123',
      data: null, // Missing required data structure
    };

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: malformedNode,
        error: null,
      }),
    });

    const result = await addCommentToNode(mockComment);

    expect(handleErrors).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should handle node with undefined comments field', async () => {
    // Create a mock node without the comments field
    const nodeWithoutComments: FyloNode = {
      id: 'node-123',
      created_at: new Date().toISOString(),
      graph_id: 'graph-123',
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        id: 'node-123',
        description: 'Test node',
        node_type: 'default',
        // comments field is intentionally omitted
      },
    };

    // Mock the fetch response
    const mockFetchResponse = {
      data: nodeWithoutComments,
      error: null,
    };

    // Mock the update response with the new comment added
    const mockUpdatedNode: FyloNode = {
      ...nodeWithoutComments,
      data: {
        ...nodeWithoutComments.data,
        comments: [mockComment],
      },
    };

    const mockUpdateResponse = {
      data: mockUpdatedNode,
      error: null,
    };

    // Setup the mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValueOnce(mockFetchResponse)
        .mockResolvedValueOnce(mockUpdateResponse),
    });

    const result = await addCommentToNode(mockComment);

    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(result).toEqual(mockUpdatedNode);
    expect(result?.data.comments).toHaveLength(1);
    expect(result?.data.comments?.[0]).toEqual(mockComment);

    // Verify that the update was called with the correct data
    const mockFromInstance = (supabaseClient.from as jest.Mock).mock.results[0].value;
    expect(mockFromInstance.update).toHaveBeenCalledWith({
      data: {
        ...nodeWithoutComments.data,
        comments: [mockComment],
      },
    });
  });
});
