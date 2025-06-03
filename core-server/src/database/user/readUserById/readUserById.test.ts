import { UserType } from '../../../consts';
import { User } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { readUserById } from './readUserById';

jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  USER_TABLE: 'User',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readUserById', () => {
  // Mock data for testing
  const mockUserId = 'user-123';
  const mockUser: User = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john@example.com',
    type: UserType.USER, // Using the UserType enum
    verified: true,
    profile_color: '#FF5733',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2023-01-01T00:00:00.000Z',
  };

  // Setup mock return values
  let mockSingle: jest.Mock;
  let mockEq: jest.Mock;
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup the Supabase method chain mocks
    mockSingle = jest.fn();
    mockEq = jest.fn().mockReturnValue({ single: mockSingle });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    // Assign mock implementation
    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);
  });

  test('should return user when found by ID', async () => {
    // Mock successful response
    mockSingle.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Call the function
    const result = await readUserById(mockUserId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', mockUserId);
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should return undefined when user not found', async () => {
    // Mock not found error
    const notFoundError = new Error('User not found');
    notFoundError.name = 'PostgrestError';
    mockSingle.mockResolvedValue({
      data: null,
      error: notFoundError,
    });

    // Call the function
    const result = await readUserById(mockUserId);

    // Assertions
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', notFoundError);
  });

  test('should handle various user types correctly', async () => {
    // Test with different user types
    const userTypes = [UserType.ADMIN, UserType.USER, UserType.GOOGLE];

    for (const userType of userTypes) {
      // Reset mocks
      jest.clearAllMocks();

      // Create mock with specific user type
      const typedUser = { ...mockUser, type: userType };

      // Mock response
      mockSingle.mockResolvedValue({
        data: typedUser,
        error: null,
      });

      // Call function
      const result = await readUserById(mockUserId);

      // Verify correct type is returned
      expect(result).toEqual(typedUser);
      expect(result?.type).toBe(userType);
    }
  });

  test('should handle verified and unverified users correctly', async () => {
    // Test both verified and unverified users
    const verificationStates = [true, false];

    for (const verifiedState of verificationStates) {
      // Reset mocks
      jest.clearAllMocks();

      // Create mock with specific verification state
      const verifiedUser = { ...mockUser, verified: verifiedState };

      // Mock response
      mockSingle.mockResolvedValue({
        data: verifiedUser,
        error: null,
      });

      // Call function
      const result = await readUserById(mockUserId);

      // Verify correct verification state is returned
      expect(result).toEqual(verifiedUser);
      expect(result?.verified).toBe(verifiedState);
    }
  });

  test('should handle empty userId gracefully', async () => {
    // Call with empty ID
    await readUserById('');

    // Should still execute the query with empty string
    expect(mockEq).toHaveBeenCalledWith('id', '');
    expect(mockSingle).toHaveBeenCalled();
  });

  test('should handle network errors', async () => {
    // Mock network error
    const networkError = new Error('Network error');
    mockSingle.mockRejectedValue(networkError);

    // Call the function
    const result = await readUserById(mockUserId);

    // Assertions
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', networkError);
  });

  test('should handle missing required user fields', async () => {
    // Mock incomplete user object missing required fields
    const incompleteUser = {
      id: mockUserId,
      name: 'John Doe',
      // Missing email, type, verified, profile_color fields
      created_at: '2023-01-01T00:00:00.000Z',
    };

    mockSingle.mockResolvedValue({
      data: incompleteUser,
      error: null,
    });

    // Call the function
    const result = await readUserById(mockUserId);

    // The function should still return whatever data Supabase returned
    expect(result).toEqual(incompleteUser);
  });

  test('should handle Date objects for created_at field', async () => {
    // Mock user with Date object for created_at
    const dateObj = new Date('2023-01-01T00:00:00.000Z');
    const userWithDateObj = {
      ...mockUser,
      created_at: dateObj,
    };

    mockSingle.mockResolvedValue({
      data: userWithDateObj,
      error: null,
    });

    // Call the function
    const result = await readUserById(mockUserId);

    // Verify the Date object is preserved
    expect(result).toEqual(userWithDateObj);
    expect(result?.created_at).toBe(dateObj);
  });

  test('should handle database connection errors', async () => {
    // Mock database connection error
    const dbError = new Error('Database connection error');
    mockSelect.mockImplementation(() => {
      throw dbError;
    });

    // Call the function
    const result = await readUserById(mockUserId);

    // Assertions
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', dbError);
  });

  test('should call Supabase with correct table name', async () => {
    // Mock successful response
    mockSingle.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Call the function
    await readUserById(mockUserId);

    // Verify table name
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
  });
});
