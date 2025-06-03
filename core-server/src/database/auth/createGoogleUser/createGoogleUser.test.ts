import { UserType } from '../../../consts';
import { handleErrors } from '../../../utils/errorHandler';
import { generateRandomColor } from '../../../utils/helpers';
import { USER_TABLE, supabaseClient } from '../../supabaseClient';

import { createGoogleUser } from './createGoogleUser';

// Mock dependencies
jest.mock('../../../utils/errorHandler');
jest.mock('../../../utils/helpers');
jest.mock('../../supabaseClient');

describe('createGoogleUser', () => {
  // Setup common test variables
  const mockName = 'Test User';
  const mockEmail = 'test@example.com';
  const mockImage = 'https://example.com/image.jpg';
  const mockColor = '#FF5733';
  const mockUser = {
    id: 'user-123',
    name: mockName,
    email: mockEmail,
    profile_color: mockColor,
    type: UserType.GOOGLE,
    verified: true,
    avatar_url: mockImage,
    created_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the return value of generateRandomColor
    (generateRandomColor as jest.Mock).mockReturnValue(mockColor);
  });

  it('should create a Google user successfully', async () => {
    // Mock Supabase response
    const mockSupabaseResponse = {
      data: mockUser,
      error: null,
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(mockSupabaseResponse),
      }),
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Execute the function
    const result = await createGoogleUser(mockName, mockEmail, mockImage);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockInsert).toHaveBeenCalledWith([
      {
        name: mockName,
        email: mockEmail,
        profile_color: mockColor,
        type: UserType.GOOGLE,
        verified: true,
        avatar_url: mockImage,
      },
    ]);
    expect(generateRandomColor).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    // Mock Supabase error response
    const mockError = new Error('Database error');
    const mockSupabaseResponse = {
      data: null,
      error: mockError,
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue(mockSupabaseResponse),
      }),
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Execute the function
    const result = await createGoogleUser(mockName, mockEmail, mockImage);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected exceptions', async () => {
    // Mock unexpected exception
    const mockError = new Error('Unexpected error');

    const mockFrom = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Execute the function
    const result = await createGoogleUser(mockName, mockEmail, mockImage);

    // Assertions
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });
});
