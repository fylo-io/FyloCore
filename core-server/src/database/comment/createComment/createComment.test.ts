import { Comment } from '../../../types/comment';
import { handleErrors } from '../../../utils/errorHandler';
import { COMMENT_TABLE, supabaseClient } from '../../supabaseClient';

import { createComment } from './createComment';

jest.mock('../../supabaseClient', () => ({
  COMMENT_TABLE: 'comments',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('createComment', () => {
  // Reset all mocks and set default timeout
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should successfully create a comment', async () => {
    // Test data
    const graphId = 'test-graph-123';
    const author = 'Test User';
    const color = '#FF5733';
    const nodeId = 'node-123';
    const text = 'Test comment';

    const mockDate = new Date('2023-01-01T12:00:00Z');
    jest.setSystemTime(mockDate);

    // Mock comment that should be returned
    const mockComment: Comment = {
      id: 'comment-123',
      created_at: mockDate,
      graph_id: graphId,
      author,
      color,
      node_id: nodeId,
      text,
    };

    // Mock chain implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockComment,
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    // Setup the main mock
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(COMMENT_TABLE);

    // Verify insert was called with correct data
    expect(mockInsert).toHaveBeenCalledWith([
      {
        created_at: mockDate,
        graph_id: graphId,
        author,
        color,
        node_id: nodeId,
        text,
      },
    ]);

    // Verify the result
    expect(result).toEqual(mockComment);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle insertion error', async () => {
    const graphId = 'test-graph-123';
    const author = 'Test User';
    const color = '#FF5733';
    const nodeId = 'node-123';
    const text = 'Test comment';

    const mockError = new Error('Database insertion error');

    // Mock chain implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle network errors', async () => {
    const graphId = 'test-graph-123';
    const author = 'Test User';
    const color = '#FF5733';
    const nodeId = 'node-123';
    const text = 'Test comment';

    const mockError = new Error('Network error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should create comment with correct date', async () => {
    const graphId = 'test-graph-123';
    const author = 'Test User';
    const color = '#FF5733';
    const nodeId = 'node-123';
    const text = 'Test comment';

    const mockDate = new Date('2023-01-01T12:00:00Z');
    jest.setSystemTime(mockDate);

    const mockComment: Comment = {
      id: 'comment-123',
      created_at: mockDate,
      graph_id: graphId,
      author,
      color,
      node_id: nodeId,
      text,
    };

    // Mock chain implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockComment,
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    expect(mockInsert).toHaveBeenCalledWith([
      {
        created_at: mockDate,
        graph_id: graphId,
        author,
        color,
        node_id: nodeId,
        text,
      },
    ]);
    expect(result?.created_at).toEqual(mockDate);
  });

  it('should handle invalid input data', async () => {
    const graphId = '';
    const author = '';
    const color = '#FF5733';
    const nodeId = 'node-123';
    const text = '';

    const mockError = new Error('Invalid input data');

    // Mock chain implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle malformed color codes', async () => {
    const graphId = 'test-graph-123';
    const author = 'Test User';
    const color = 'invalid-color';
    const nodeId = 'node-123';
    const text = 'Test comment';

    const mockError = new Error('Invalid color format');

    // Mock chain implementation
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    const result = await createComment(graphId, author, color, nodeId, text);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });
});
