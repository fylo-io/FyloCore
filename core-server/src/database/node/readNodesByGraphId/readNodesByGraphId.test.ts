import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { readNodesByGraphId } from './readNodesByGraphId';

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

describe('readNodesByGraphId', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return nodes when query is successful', async () => {
    // Arrange
    const mockNodes = [
      { id: '1', graph_id: 'graph-123', name: 'Node 1' },
      { id: '2', graph_id: 'graph-123', name: 'Node 2' },
    ];

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: mockNodes,
        error: null,
      }),
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Act
    const result = await readNodesByGraphId('graph-123');

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockFrom().select().eq).toHaveBeenCalledWith('graph_id', 'graph-123');
    expect(result).toEqual(mockNodes);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle Supabase error and return undefined', async () => {
    // Arrange
    const mockError = new Error('Database error');

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Act
    const result = await readNodesByGraphId('graph-123');

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockFrom().select().eq).toHaveBeenCalledWith('graph_id', 'graph-123');
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected errors during execution', async () => {
    // Arrange
    const unexpectedError = new Error('Unexpected error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    // Act
    const result = await readNodesByGraphId('graph-123');

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', unexpectedError);
    expect(result).toBeUndefined();
  });

  it('should pass the correct graph ID to the query', async () => {
    // Arrange
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Act
    await readNodesByGraphId('different-graph-id');

    // Assert
    expect(mockFrom().select().eq).toHaveBeenCalledWith('graph_id', 'different-graph-id');
  });
});
