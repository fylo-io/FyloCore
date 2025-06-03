import { UserType } from '../../../consts';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { readGoogleUserByEmail } from './readGoogleUserByEmail';

jest.mock('../../supabaseClient', () => ({
  USER_TABLE: 'users',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

jest.mock('../../../consts', () => ({
  UserType: {
    GOOGLE: 'google',
    EMAIL: 'email',
    // Include other types if needed
  },
}));

describe('readGoogleUserByEmail', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a Google user by email', async () => {
    // Test email
    const email = 'test@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name: 'Test User',
      email,
      type: UserType.GOOGLE,
      verified: true,
      avatar_url: 'https://example.com/avatar.jpg',
      profile_color: '#FF5733',
      created_at: new Date().toISOString(),
    };

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readGoogleUserByEmail(email);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify eq was called with correct arguments
    // Since eq is called twice in sequence, we verify both calls
    expect(mockEq).toHaveBeenNthCalledWith(1, 'email', email);
    expect(mockEq).toHaveBeenNthCalledWith(2, 'type', UserType.GOOGLE);

    // Verify single was called
    expect(mockSingle).toHaveBeenCalled();

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return undefined when no Google user with that email exists', async () => {
    // Test email that doesn't exist as a Google user
    const email = 'nonexistent@example.com';

    // Mock error for no results
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readGoogleUserByEmail(email);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle the case where a user exists but is not a Google user', async () => {
    // Test email for a non-Google user
    const email = 'regularuser@example.com';

    // Mock error for no results (since the type filter won't match)
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readGoogleUserByEmail(email);

    // Verify that eq was called with correct type filter
    expect(mockEq).toHaveBeenCalledWith('type', UserType.GOOGLE);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle database errors properly', async () => {
    // Test email
    const email = 'test@example.com';

    // Mock database error
    const mockError = new Error('Database connection error');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readGoogleUserByEmail(email);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Test email
    const email = 'test@example.com';

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await readGoogleUserByEmail(email);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the exception
    expect(result).toBeUndefined();
  });
});
