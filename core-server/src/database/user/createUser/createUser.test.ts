import { handleErrors } from '../../../utils/errorHandler';
import { generateRandomColor } from '../../../utils/helpers';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { createUser } from './createUser';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  USER_TABLE: 'users',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

jest.mock('../../../utils/helpers', () => ({
  generateRandomColor: jest.fn(),
}));

describe('createUser', () => {
  // Setup common test variables
  const mockName = 'Test User';
  const mockEmail = 'test@example.com';
  const mockPassword = 'password123';
  const mockColor = '#FF5733';
  const mockUser = {
    id: 'user-123',
    name: mockName,
    email: mockEmail,
    password: mockPassword,
    profile_color: mockColor,
    created_at: '2023-01-01T00:00:00Z',
  };

  // Mock implementations
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockSingle = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup the chain of mock functions
    mockSingle.mockResolvedValue({ data: mockUser, error: null });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });

    // Mock the Supabase client's chain
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });

    // Mock the color generator
    (generateRandomColor as jest.Mock).mockReturnValue(mockColor);
  });

  test('should create a user successfully', async () => {
    // Call the function
    const result = await createUser(mockName, mockEmail, mockPassword);

    // Verify Supabase client was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockInsert).toHaveBeenCalledWith([
      {
        name: mockName,
        email: mockEmail,
        password: mockPassword,
        profile_color: mockColor,
      },
    ]);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockSingle).toHaveBeenCalled();

    // Verify color generator was called
    expect(generateRandomColor).toHaveBeenCalled();

    // Verify the result
    expect(result).toEqual(mockUser);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    // Setup error scenario
    const mockError = new Error('Database error');
    mockSingle.mockResolvedValue({ data: null, error: mockError });

    // Call the function
    const result = await createUser(mockName, mockEmail, mockPassword);

    // Verify error handler was called
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  test('should handle unexpected exceptions', async () => {
    // Setup exception scenario
    mockInsert.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    // Call the function
    const result = await createUser(mockName, mockEmail, mockPassword);

    // Verify error handler was called
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));

    // Verify the result is undefined
    expect(result).toBeUndefined();
  });

  test('should call generateRandomColor for profile color', async () => {
    await createUser(mockName, mockEmail, mockPassword);

    expect(generateRandomColor).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        profile_color: mockColor,
      }),
    ]);
  });
});
