import { handleErrors } from '../../../utils/errorHandler';
import { SHARE_TABLE, supabaseClient } from '../../supabaseClient';

import { readSharedUserIds } from './readSharedUserIds';

// Mock dependencies
jest.mock('../../supabaseClient', () => {
  // Create mock functions with proper chaining
  const mockEq = jest.fn();
  const mockSelect = jest.fn(() => ({ eq: mockEq }));

  return {
    SHARE_TABLE: 'shares',
    supabaseClient: {
      from: jest.fn(() => ({
        select: mockSelect,
      })),
    },
    __mocks: {
      mockEq,
      mockSelect,
    },
  };
});

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

// Import mocks after they've been set up
const { __mocks } = jest.requireMock('../../supabaseClient');

describe('readSharedUserIds', () => {
  // Test data
  const mockGraphId = 'graph-123';
  const mockSharedUsers = [{ user_id: 'user-1' }, { user_id: 'user-2' }, { user_id: 'user-3' }];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default successful response
    __mocks.mockEq.mockResolvedValue({
      data: mockSharedUsers,
      error: null,
    });
  });

  test('should return array of user IDs when query is successful', async () => {
    // Act
    const result = await readSharedUserIds(mockGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', mockGraphId);

    expect(result).toEqual(['user-1', 'user-2', 'user-3']);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should return empty array when no shared users exist', async () => {
    // Arrange
    __mocks.mockEq.mockResolvedValue({
      data: [],
      error: null,
    });

    // Act
    const result = await readSharedUserIds(mockGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', mockGraphId);

    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should handle database error and return undefined', async () => {
    // Arrange
    const mockError = new Error('Database query failed');
    __mocks.mockEq.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act
    const result = await readSharedUserIds(mockGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', mockGraphId);

    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  test('should handle unexpected exception during query', async () => {
    // Arrange
    const mockError = new Error('Unexpected error');
    __mocks.mockEq.mockRejectedValue(mockError);

    // Act
    const result = await readSharedUserIds(mockGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', mockGraphId);

    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  test('should handle invalid graph ID', async () => {
    // Arrange
    const invalidGraphId = '';

    // Act
    await readSharedUserIds(invalidGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', invalidGraphId);
  });

  test('should handle null data response', async () => {
    // Arrange
    __mocks.mockEq.mockResolvedValue({
      data: null,
      error: null,
    });

    // Act
    const result = await readSharedUserIds(mockGraphId);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('user_id');
    expect(__mocks.mockEq).toHaveBeenCalledWith('graph_id', mockGraphId);

    // If data is null, we expect an error during the map function
    expect(handleErrors).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
