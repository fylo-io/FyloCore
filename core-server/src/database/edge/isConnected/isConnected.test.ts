import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, supabaseClient } from '../../supabaseClient';

import { isConnected } from './isConnected';

jest.mock('../../supabaseClient', () => ({
  EDGE_TABLE: 'edges',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('isConnected', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when nodes are connected (source -> target)', async () => {
    // Test node IDs
    const source = 'node1';
    const target = 'node2';

    // Mock edge data that shows connection
    const mockEdges = [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        created_at: new Date().toISOString(),
      },
    ];

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: mockEdges,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await isConnected(source, target);

    // Verify the function called supabase with correct arguments
    expect(supabaseClient.from).toHaveBeenCalledWith(EDGE_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOr).toHaveBeenCalledWith(
      `and(source.eq.${source},target.eq.${target}),and(source.eq.${target},target.eq.${source})`,
    );

    // Verify the result is true
    expect(result).toBe(true);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return true when nodes are connected (target -> source)', async () => {
    // Test node IDs
    const source = 'node1';
    const target = 'node2';

    // Mock edge data that shows reverse connection
    const mockEdges = [
      {
        id: 'edge1',
        source: 'node2',
        target: 'node1',
        created_at: new Date().toISOString(),
      },
    ];

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: mockEdges,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await isConnected(source, target);

    // Verify the result is true
    expect(result).toBe(true);
  });

  it('should return false when nodes are not connected', async () => {
    // Test node IDs
    const source = 'node1';
    const target = 'node2';

    // Mock empty edge data
    // eslint-disable-next-line
    const mockEdges: any[] = [];

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: mockEdges,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await isConnected(source, target);

    // Verify the result is false
    expect(result).toBe(false);
  });

  it('should handle database errors and return false', async () => {
    // Test node IDs
    const source = 'node1';
    const target = 'node2';

    // Mock database error
    const mockError = new Error('Database connection error');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await isConnected(source, target);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is false due to the error
    expect(result).toBe(false);
  });

  it('should handle exceptions during the database operation and return false', async () => {
    // Test node IDs
    const source = 'node1';
    const target = 'node2';

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await isConnected(source, target);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is false due to the exception
    expect(result).toBe(false);
  });

  it('should handle edge cases with special characters in node IDs', async () => {
    // Test node IDs with special characters
    const source = 'node#1';
    const target = 'node@2';

    // Mock empty edge data
    // eslint-disable-next-line
    const mockEdges: any[] = [];

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockResolvedValue({
      data: mockEdges,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await isConnected(source, target);

    // Verify the function handles special characters correctly
    expect(mockOr).toHaveBeenCalledWith(
      `and(source.eq.${source},target.eq.${target}),and(source.eq.${target},target.eq.${source})`,
    );

    // Verify the result is false
    expect(result).toBe(false);
  });
});
