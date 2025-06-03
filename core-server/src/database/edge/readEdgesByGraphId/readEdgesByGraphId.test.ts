import { FyloEdge } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { readEdgesByGraphId } from './readEdgesByGraphId';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readEdgesByGraphId', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Increased timeout and simplified mock implementation
  it('should successfully retrieve edges for a given graph id', async () => {
    const graphId = 'test-graph-123';

    const mockEdges: FyloEdge[] = [
      {
        id: 'edge-1',
        graph_id: graphId,
        type: 'default',
        source: 'node-1',
        target: 'node-2',
        data: {
          label: 'Edge 1',
          description: 'First test edge',
        },
      },
      {
        id: 'edge-2',
        graph_id: graphId,
        type: 'custom',
        source: 'node-2',
        target: 'node-3',
        data: {
          label: 'Edge 2',
          description: 'Second test edge',
        },
      },
    ];

    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: mockEdges,
        error: null,
      }),
    });

    const result = await readEdgesByGraphId(graphId);

    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(result).toEqual(mockEdges);
    expect(handleErrors).not.toHaveBeenCalled();
  }, 10000); // Increased timeout to 10 seconds

  it('should return empty array when no edges exist for the graph', async () => {
    const graphId = 'empty-graph-123';

    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    const result = await readEdgesByGraphId(graphId);

    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  }, 10000);

  it('should handle database errors properly', async () => {
    const graphId = 'test-graph-123';
    const mockError = new Error('Database connection error');

    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    const result = await readEdgesByGraphId(graphId);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  }, 10000);

  it('should handle exceptions during the database operation', async () => {
    const graphId = 'test-graph-123';
    const mockError = new Error('Network error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await readEdgesByGraphId(graphId);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  }, 10000);

  it('should handle edges with complex data structures', async () => {
    const graphId = 'test-graph-123';

    const mockEdge: FyloEdge = {
      id: 'edge-complex',
      graph_id: graphId,
      type: 'custom',
      source: 'node-1',
      target: 'node-2',
      data: {
        label: 'Complex Edge',
        description: 'Edge with complex data',
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

    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [mockEdge],
        error: null,
      }),
    });

    const result = await readEdgesByGraphId(graphId);

    expect(result).toEqual([mockEdge]);
    expect(result?.[0].data.comments?.length).toBe(2);
    expect(result?.[0].data.comments?.[0].text).toBe('First comment');
  }, 10000);
});
