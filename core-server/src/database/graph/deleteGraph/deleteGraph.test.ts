import { handleErrors } from '../../../utils/errorHandler';
import { EDGE_TABLE, GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { deleteGraph } from './deleteGraph';

// Define proper types for our mock
type MockFn = jest.Mock & { mockReturnThis: () => MockFn };
interface MockChain {
  from: MockFn;
  delete: MockFn;
  eq: MockFn;
}

// Mock dependencies
jest.mock('../../supabaseClient', () => {
  // Create a properly typed mock
  const createMockFn = (): MockFn => {
    const fn = jest.fn(() => mockChain) as MockFn;
    fn.mockReturnThis = () => fn;
    return fn;
  };

  // Create the mock chain with proper typing
  const mockChain: MockChain = {
    from: createMockFn(),
    delete: createMockFn(),
    eq: createMockFn(),
  };

  return {
    GRAPH_TABLE: 'graphs',
    NODE_TABLE: 'nodes',
    EDGE_TABLE: 'edges',
    supabaseClient: mockChain,
  };
});

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

// Cast the mocked module to the proper type to avoid TypeScript errors
const mockedSupabaseClient = supabaseClient as unknown as MockChain;
const mockedHandleErrors = handleErrors as jest.Mock;

describe('deleteGraph', () => {
  const graphId = 'test-graph-id';

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the behavior of our mocks to return the mock chain
    Object.values(mockedSupabaseClient).forEach((fn) => {
      fn.mockReturnThis();
    });
  });

  it('should delete a graph and its associated nodes and edges', async () => {
    // Arrange
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });

    // Act
    await deleteGraph(graphId);

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(1, GRAPH_TABLE);
    expect(mockedSupabaseClient.delete).toHaveBeenCalledTimes(3);
    expect(mockedSupabaseClient.eq).toHaveBeenNthCalledWith(1, 'id', graphId);

    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(2, NODE_TABLE);
    expect(mockedSupabaseClient.eq).toHaveBeenNthCalledWith(2, 'graph_id', graphId);

    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(3, EDGE_TABLE);
    expect(mockedSupabaseClient.eq).toHaveBeenNthCalledWith(3, 'graph_id', graphId);

    expect(mockedHandleErrors).not.toHaveBeenCalled();
  });

  it('should handle errors when deleting a graph', async () => {
    // Arrange
    const mockError = new Error('Failed to delete graph');
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: mockError });

    // Act
    await deleteGraph(graphId);

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(mockedSupabaseClient.delete).toHaveBeenCalledTimes(1);
    expect(mockedSupabaseClient.eq).toHaveBeenCalledWith('id', graphId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle errors when deleting nodes', async () => {
    // Arrange
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });
    const mockError = new Error('Failed to delete nodes');
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: mockError });

    // Act
    await deleteGraph(graphId);

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(1, GRAPH_TABLE);
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(2, NODE_TABLE);
    expect(mockedSupabaseClient.delete).toHaveBeenCalledTimes(2);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle errors when deleting edges', async () => {
    // Arrange
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: null });
    const mockError = new Error('Failed to delete edges');
    mockedSupabaseClient.eq.mockResolvedValueOnce({ error: mockError });

    // Act
    await deleteGraph(graphId);

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(1, GRAPH_TABLE);
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(2, NODE_TABLE);
    expect(mockedSupabaseClient.from).toHaveBeenNthCalledWith(3, EDGE_TABLE);
    expect(mockedSupabaseClient.delete).toHaveBeenCalledTimes(3);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle unexpected errors', async () => {
    // Arrange
    const unexpectedError = new Error('Unexpected error');
    mockedSupabaseClient.from.mockImplementationOnce(() => {
      throw unexpectedError;
    });

    // Act
    await deleteGraph(graphId);

    // Assert
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', unexpectedError);
  });
});
