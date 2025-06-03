import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { readUserByNameOrEmail } from './readUserByNameOrEmail';

jest.mock('../../supabaseClient', () => ({
  USER_TABLE: 'users',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readUserByNameOrEmail', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a user by name', async () => {
    // Test value that matches a username
    const nameOrEmail = 'Test User';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name: nameOrEmail,
      email: 'test@example.com', // Different email to confirm name search worked
      password: 'hashedPassword123',
      profile_color: '#FF5733',
      created_at: new Date().toISOString(),
    };

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify or was called with correct filter
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`);

    // Verify not was called to exclude users without passwords
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);

    // Verify single was called
    expect(mockSingle).toHaveBeenCalled();

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should successfully retrieve a user by email', async () => {
    // Test value that matches an email
    const nameOrEmail = 'test@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name: 'Different Name', // Different name to confirm email search worked
      email: nameOrEmail,
      password: 'hashedPassword123',
      profile_color: '#FF5733',
      created_at: new Date().toISOString(),
    };

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify the or filter includes both conditions
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`);

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);
  });

  it('should return undefined when no user matches the name or email', async () => {
    // Test value that doesn't match any user
    const nameOrEmail = 'nonexistent';

    // Mock error for no results
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify the expected query was built
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`);
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);

    // Verify the result is undefined as expected
    expect(result).toBeUndefined();

    // Verify error handler was not called (function returns undefined directly)
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should filter out users without passwords', async () => {
    // Test value for an OAuth user (no password)
    const nameOrEmail = 'oauth@example.com';

    // Mock error for no results after password filter
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify the not filter was applied
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);

    // Verify the result is undefined as expected
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Test value
    const nameOrEmail = 'test@example.com';

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the exception
    expect(result).toBeUndefined();
  });

  it('should handle empty string input', async () => {
    // Empty string input
    const nameOrEmail = '';

    // Mock error for no results with empty string
    const mockError = new Error('No rows matched the query');

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify or was called with empty string
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`);

    // Verify the result is undefined as expected
    expect(result).toBeUndefined();
  });

  it('should handle special characters in name or email', async () => {
    // Test value with special characters
    const nameOrEmail = 'test+filter@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name: 'Regular Name',
      email: nameOrEmail,
      password: 'hashedPassword123',
      profile_color: '#FF5733',
      created_at: new Date().toISOString(),
    };

    // Create mock functions for the chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOr = jest.fn().mockReturnThis();
    const mockNot = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });

    // Setup the mock chain
    const mockQueryBuilder = {
      select: mockSelect,
      or: mockOr,
      not: mockNot,
      single: mockSingle,
    };

    // Setup the from mock to return our query builder
    (supabaseClient.from as jest.Mock).mockReturnValue(mockQueryBuilder);

    // Call the function
    const result = await readUserByNameOrEmail(nameOrEmail);

    // Verify or was called with exactly the string provided
    // This tests that the function doesn't modify or escape the string
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${nameOrEmail},email.eq.${nameOrEmail}`);

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);
  });
});
