import { UserType } from '../../../consts';
import { GRAPH_TABLE, SHARE_TABLE, supabaseClient } from '../../../database/supabaseClient';
import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';

import { createShare } from './createShare';

// Mock dependencies
jest.mock('../../../database/supabaseClient', () => {
  // Create mock functions with proper chaining
  const mockSingle = jest.fn();
  const mockEq = jest.fn(() => ({ single: mockSingle }));
  const mockSelect = jest.fn(() => ({ eq: mockEq }));
  const mockUpdate = jest.fn();
  const mockUpdateEq = jest.fn();
  const mockInsert = jest.fn();

  return {
    SHARE_TABLE: 'shares',
    GRAPH_TABLE: 'graphs',
    supabaseClient: {
      from: jest.fn((table) => {
        if (table === 'shares') {
          return { insert: mockInsert };
        } else if (table === 'graphs') {
          return {
            select: mockSelect,
            update: mockUpdate.mockReturnValue({ eq: mockUpdateEq }),
          };
        }
        return {};
      }),
    },
    __mocks: {
      mockSingle,
      mockEq,
      mockSelect,
      mockUpdate,
      mockUpdateEq,
      mockInsert,
    },
  };
});

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

// Import mocks after they've been set up
const { __mocks } = jest.requireMock('../../../database/supabaseClient');

describe('createShare', () => {
  // Mock data
  const graphId = 'graph-123';
  const invalidGraphId = 'invalid-graph';

  const mockUser: User = {
    id: 'user-123',
    created_at: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    type: 'standard' as UserType,
    verified: true,
    profile_color: '#FF5733',
    avatar_url: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the default behaviors
    __mocks.mockInsert.mockResolvedValue({ error: null });
    __mocks.mockSingle.mockResolvedValue({
      data: { contributors: [] },
      error: null,
    });
    __mocks.mockUpdateEq.mockResolvedValue({ error: null });
  });

  test('should create a share and add a new contributor', async () => {
    // Arrange
    __mocks.mockSingle.mockResolvedValue({
      data: { contributors: [] },
      error: null,
    });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalledWith([
      {
        graph_id: graphId,
        user_id: mockUser.id,
      },
    ]);

    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', graphId);

    expect(__mocks.mockUpdate).toHaveBeenCalledWith({
      contributors: [
        {
          name: mockUser.name,
          profile_color: mockUser.profile_color,
        },
      ],
    });
    expect(__mocks.mockUpdateEq).toHaveBeenCalledWith('id', graphId);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should not add duplicate contributor when user is already a contributor', async () => {
    // Arrange
    __mocks.mockSingle.mockResolvedValue({
      data: {
        contributors: [
          {
            name: mockUser.name,
            profile_color: mockUser.profile_color,
          },
        ],
      },
      error: null,
    });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', graphId);

    // Update should not be called
    expect(__mocks.mockUpdate).not.toHaveBeenCalled();
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should handle error when inserting share fails', async () => {
    // Arrange
    const mockError = new Error('Insert failed');
    __mocks.mockInsert.mockResolvedValue({ error: mockError });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify graph operations weren't called
    expect(supabaseClient.from).not.toHaveBeenCalledWith(GRAPH_TABLE);
  });

  test('should handle error when fetching graph fails', async () => {
    // Arrange
    const mockError = new Error('Fetch failed');
    __mocks.mockSingle.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', graphId);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  test('should handle error when graph id is invalid', async () => {
    // Arrange
    const mockError = new Error('Graph not found');
    __mocks.mockSingle.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act
    await createShare(invalidGraphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', invalidGraphId);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  test('should handle error when updating graph contributors fails', async () => {
    // Arrange
    const mockError = new Error('Update failed');
    __mocks.mockUpdateEq.mockResolvedValue({ error: mockError });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', graphId);
    expect(__mocks.mockUpdate).toHaveBeenCalled();
    expect(__mocks.mockUpdateEq).toHaveBeenCalledWith('id', graphId);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  test('should handle case when graph data is undefined', async () => {
    // Arrange
    __mocks.mockSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Act
    await createShare(graphId, mockUser);

    // Assert
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(__mocks.mockInsert).toHaveBeenCalled();
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(__mocks.mockSelect).toHaveBeenCalledWith('contributors');
    expect(__mocks.mockEq).toHaveBeenCalledWith('id', graphId);

    // Should try to update with an empty array as current contributors
    expect(__mocks.mockUpdate).toHaveBeenCalledWith({
      contributors: [
        {
          name: mockUser.name,
          profile_color: mockUser.profile_color,
        },
      ],
    });
    expect(__mocks.mockUpdateEq).toHaveBeenCalledWith('id', graphId);
    expect(handleErrors).not.toHaveBeenCalled();
  });
});
