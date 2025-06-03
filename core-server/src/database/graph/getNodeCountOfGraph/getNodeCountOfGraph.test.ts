import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

import { getNodeCountOfGraph } from './getNodeCountOfGraph';

// Mock the dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  NODE_TABLE: 'nodes',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('getNodeCountOfGraph', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the correct node count for a valid graph ID', async () => {
    // Mock data for a graph with 3 nodes
    const mockNodes = [
      { id: 'node1', graph_id: 'graph123' },
      { id: 'node2', graph_id: 'graph123' },
      { id: 'node3', graph_id: 'graph123' },
    ];

    // Setup the supabase mock implementation
    const mockFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockNodes,
          error: null,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function with a graph ID
    const count = await getNodeCountOfGraph('graph123');

    // Assert that supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('nodes');
    expect(mockFromObject.select).toHaveBeenCalledWith('*');
    expect(mockFromObject.select().eq).toHaveBeenCalledWith('graph_id', 'graph123');

    // Assert that the correct count was returned
    expect(count).toBe(3);

    // Verify error handling was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return zero for a graph with no nodes', async () => {
    // Mock empty data return
    const mockFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function
    const count = await getNodeCountOfGraph('emptyGraph');

    // Assert that supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('nodes');
    expect(mockFromObject.select).toHaveBeenCalledWith('*');
    expect(mockFromObject.select().eq).toHaveBeenCalledWith('graph_id', 'emptyGraph');

    // Assert that zero was returned
    expect(count).toBe(0);

    // Verify error handling was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle errors from Supabase and return undefined', async () => {
    // Mock Supabase error
    const mockError = new Error('Database error');

    const mockFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function
    const count = await getNodeCountOfGraph('errorGraph');

    // Assert that supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('nodes');
    expect(mockFromObject.select).toHaveBeenCalledWith('*');
    expect(mockFromObject.select().eq).toHaveBeenCalledWith('graph_id', 'errorGraph');

    // Assert that handleErrors was called with the error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Assert that undefined was returned
    expect(count).toBeUndefined();
  });
});
