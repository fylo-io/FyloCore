import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { updateUserProfile } from './updateUserProfile';

jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  USER_TABLE: 'User',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('updateUserProfile', () => {
  // Setup common test variables
  const userId = 'user-123';
  const profileColor = '#FF5733';
  const avatarUrl = 'https://example.com/avatar.jpg';

  // Setup mock return values
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;
  let mockSingle: jest.Mock;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup the Supabase method chain mocks
    mockSingle = jest.fn();
    mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    // Assign mock implementation to supabaseClient.from
    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);
  });

  test('should update user profile with profile color only', async () => {
    // Mock successful response
    mockSingle.mockResolvedValue({
      data: { id: userId, profile_color: profileColor },
      error: null,
    });

    // Call the function with null avatarUrl
    const result = await updateUserProfile(userId, profileColor, null);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockUpdate).toHaveBeenCalledWith({ profile_color: profileColor });
    expect(mockEq).toHaveBeenCalledWith('id', userId);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      data: { id: userId, profile_color: profileColor },
    });
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should update user profile with both profile color and avatar URL', async () => {
    // Mock successful response
    mockSingle.mockResolvedValue({
      data: {
        id: userId,
        profile_color: profileColor,
        avatar_url: avatarUrl,
      },
      error: null,
    });

    // Call the function with avatarUrl
    const result = await updateUserProfile(userId, profileColor, avatarUrl);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockUpdate).toHaveBeenCalledWith({
      profile_color: profileColor,
      avatar_url: avatarUrl,
    });
    expect(mockEq).toHaveBeenCalledWith('id', userId);
    expect(result).toEqual({
      success: true,
      data: {
        id: userId,
        profile_color: profileColor,
        avatar_url: avatarUrl,
      },
    });
  });

  test("shouldn't remove avatar URL when undefined is passed", async () => {
    // Mock successful response
    mockSingle.mockResolvedValue({
      data: { id: userId, profile_color: profileColor, avatar_url: null },
      error: null,
    });

    // Call the function with undefined avatarUrl
    const result = await updateUserProfile(userId, profileColor, undefined);

    // Assertions
    expect(mockUpdate).toHaveBeenCalledWith({ profile_color: profileColor });
    expect(result.success).toBe(true);
    // Avatar URL should be in the update payload
    expect(mockUpdate.mock.calls[0][0]).toHaveProperty('avatar_url');
  });

  test('should handle Supabase error properly', async () => {
    // Mock error response
    const testError = new Error('Database update failed');
    mockSingle.mockResolvedValue({
      data: null,
      error: testError,
    });

    // Call the function
    const result = await updateUserProfile(userId, profileColor, avatarUrl);

    // Assertions
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', testError);
    expect(result).toEqual({
      success: false,
      error: 'Database update failed',
    });
  });

  test('should handle unexpected exceptions', async () => {
    // Mock implementation that throws an exception
    mockSingle.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    // Call the function
    const result = await updateUserProfile(userId, profileColor, avatarUrl);

    // Assertions
    expect(handleErrors).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: 'Unexpected error',
    });
  });

  test('should handle empty userId gracefully', async () => {
    // Call with empty ID (invalid case)
    const result = await updateUserProfile('', profileColor, avatarUrl);

    // Still attempts the update but will likely fail at the database level
    expect(mockEq).toHaveBeenCalledWith('id', '');
    // The function itself shouldn't throw
    expect(result).toBeDefined();
  });
});
