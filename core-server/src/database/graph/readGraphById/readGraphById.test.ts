import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

import { readGraphById } from './readGraphById';

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

describe('readGraphById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch a graph by id', async () => {
    // Create mock graph data
    const mockGraph: FyloGraph = {
      id: 'graph123',
      created_at: '2023-01-01T00:00:00Z',
      title: 'Test Graph',
      description: 'A test graph for unit testing',
      creator_id: 'user456',
      type: GraphType.PRIVATE,
      node_count: 5,
    };

    // Setup supabase mock chain
    const mockSingleMethod = jest.fn().mockResolvedValue({
      data: mockGraph,
      error: null,
    });

    const mockEqMethod = jest.fn().mockReturnValue({
      single: mockSingleMethod,
    });

    const mockSelectMethod = jest.fn().mockReturnValue({
      eq: mockEqMethod,
    });

    const mockFromObject = {
      select: mockSelectMethod,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function
    const result = await readGraphById('graph123');

    // Verify supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockSelectMethod).toHaveBeenCalledWith('*');
    expect(mockEqMethod).toHaveBeenCalledWith('id', 'graph123');
    expect(mockSingleMethod).toHaveBeenCalled();

    // Verify result
    expect(result).toEqual(mockGraph);
  });

  it('should handle supabase error and return undefined', async () => {
    // Setup supabase mock to return an error
    const mockError = new Error('Graph not found');

    const mockSingleMethod = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockEqMethod = jest.fn().mockReturnValue({
      single: mockSingleMethod,
    });

    const mockSelectMethod = jest.fn().mockReturnValue({
      eq: mockEqMethod,
    });

    const mockFromObject = {
      select: mockSelectMethod,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function
    const result = await readGraphById('nonexistent-id');

    // Verify supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');
    expect(mockSelectMethod).toHaveBeenCalledWith('*');
    expect(mockEqMethod).toHaveBeenCalledWith('id', 'nonexistent-id');
    expect(mockSingleMethod).toHaveBeenCalled();

    // Verify error was handled
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected exceptions', async () => {
    // Setup supabase mock to throw an exception
    const unexpectedError = new Error('Unexpected database error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    // Call the function
    const result = await readGraphById('graph123');

    // Verify error was handled
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', unexpectedError);
    expect(result).toBeUndefined();
  });

  it('should handle null data with no error', async () => {
    // Setup supabase mock to return null data but no error
    const mockSingleMethod = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockEqMethod = jest.fn().mockReturnValue({
      single: mockSingleMethod,
    });

    const mockSelectMethod = jest.fn().mockReturnValue({
      eq: mockEqMethod,
    });

    const mockFromObject = {
      select: mockSelectMethod,
    };

    (supabaseClient.from as jest.Mock).mockReturnValue(mockFromObject);

    // Call the function
    const result = await readGraphById('graph123');

    // Verify supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith('graphs');

    // Verify result
    expect(result).toBeNull();
  });
});
