import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

import { readPublicGraphs } from './readPublicGraphs';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  GRAPH_TABLE: 'graphs',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readPublicGraphs', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return public graphs successfully', async () => {
    // Mock data for public graphs
    const mockPublicGraphs: FyloGraph[] = [
      {
        id: 'graph1',
        title: 'Public Graph 1',
        description: 'First public graph',
        created_at: '2023-01-01T00:00:00Z',
        creator_id: 'user1',
        type: GraphType.PUBLIC,
        node_count: 5,
      },
      {
        id: 'graph2',
        title: 'Public Graph 2',
        description: 'Second public graph',
        created_at: '2023-01-02T00:00:00Z',
        creator_id: 'user2',
        type: GraphType.PUBLIC,
        node_count: 10,
      },
    ];

    // Setup mock response chain
    const mockSelectResponse = {
      eq: jest.fn().mockResolvedValue({
        data: mockPublicGraphs,
        error: null,
      }),
    };

    const mockFromResponse = {
      select: jest.fn().mockReturnValue(mockSelectResponse),
    };

    // Configure supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromResponse);

    // Call the function
    const result = await readPublicGraphs();

    // Verify supabase client was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockFromResponse.select).toHaveBeenCalledWith('*');
    expect(mockSelectResponse.eq).toHaveBeenCalledWith('type', GraphType.PUBLIC);

    // Verify the result matches our mock data
    expect(result).toEqual(mockPublicGraphs);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database query error', async () => {
    // Mock error response
    const mockError = new Error('Database query failed');

    const mockSelectResponse = {
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    };

    const mockFromResponse = {
      select: jest.fn().mockReturnValue(mockSelectResponse),
    };

    // Configure supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromResponse);

    // Call the function
    const result = await readPublicGraphs();

    // Verify supabase client was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockFromResponse.select).toHaveBeenCalledWith('*');
    expect(mockSelectResponse.eq).toHaveBeenCalledWith('type', GraphType.PUBLIC);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected exceptions', async () => {
    // Mock unexpected exception
    const mockError = new Error('Unexpected error');

    const mockSelectResponse = {
      eq: jest.fn().mockRejectedValue(mockError),
    };

    const mockFromResponse = {
      select: jest.fn().mockReturnValue(mockSelectResponse),
    };

    // Configure supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromResponse);

    // Call the function
    const result = await readPublicGraphs();

    // Verify supabase client was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockFromResponse.select).toHaveBeenCalledWith('*');
    expect(mockSelectResponse.eq).toHaveBeenCalledWith('type', GraphType.PUBLIC);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should return empty array when no public graphs exist', async () => {
    // Mock empty response
    const mockSelectResponse = {
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    const mockFromResponse = {
      select: jest.fn().mockReturnValue(mockSelectResponse),
    };

    // Configure supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromResponse);

    // Call the function
    const result = await readPublicGraphs();

    // Verify supabase client was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockFromResponse.select).toHaveBeenCalledWith('*');
    expect(mockSelectResponse.eq).toHaveBeenCalledWith('type', GraphType.PUBLIC);

    // Verify result is an empty array
    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });
});
