import { Comment } from '../../../types/comment';
import { handleErrors } from '../../../utils/errorHandler';
import { COMMENT_TABLE, supabaseClient } from '../../supabaseClient';

import { readCommentsByGraphId } from './readCommentsByGraphId';

jest.mock('../../supabaseClient', () => ({
  COMMENT_TABLE: 'comments',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readCommentsByGraphId', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Increase timeout for all tests in this describe block
  jest.setTimeout(10000);

  it('should successfully retrieve comments for a graph', async () => {
    const graphId = 'test-graph-123';

    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        created_at: new Date().toISOString(),
        graph_id: graphId,
        author: 'User 1',
        color: '#FF5733',
        text: 'First comment',
        node_id: 'node-1',
      },
    ];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockComments,
          error: null,
        }),
      }),
    });

    const result = await readCommentsByGraphId(graphId);

    expect(supabaseClient.from).toHaveBeenCalledWith(COMMENT_TABLE);
    expect(result).toEqual(mockComments);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return empty array when no comments exist for the graph', async () => {
    const graphId = 'graph-with-no-comments';

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const result = await readCommentsByGraphId(graphId);

    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    const graphId = 'test-graph-123';
    const mockError = new Error('Database connection error');

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    const result = await readCommentsByGraphId(graphId);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    const graphId = 'test-graph-123';
    const mockError = new Error('Network error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await readCommentsByGraphId(graphId);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should retrieve comments with different optional field combinations', async () => {
    const graphId = 'test-graph-123';

    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        created_at: new Date().toISOString(),
        graph_id: graphId,
        author: 'User 1',
        color: '#FF5733',
        text: 'Node comment',
        node_id: 'node-1',
      },
      {
        id: 'comment-2',
        created_at: new Date().toISOString(),
        graph_id: graphId,
        author: 'User 2',
        color: '#33FF57',
        text: 'Edge comment',
        edge_id: 'edge-1',
      },
      {
        id: 'comment-3',
        created_at: new Date().toISOString(),
        graph_id: graphId,
        author: 'User 3',
        color: '#3357FF',
        text: 'General comment',
      },
    ];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockComments,
          error: null,
        }),
      }),
    });

    const result = await readCommentsByGraphId(graphId);

    expect(result).toEqual(mockComments);
    expect(result?.[0].node_id).toBeDefined();
    expect(result?.[1].edge_id).toBeDefined();
    expect(result?.[2].node_id).toBeUndefined();
    expect(result?.[2].edge_id).toBeUndefined();
  });
});
