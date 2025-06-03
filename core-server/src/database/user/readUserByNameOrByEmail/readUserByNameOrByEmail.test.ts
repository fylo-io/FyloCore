import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { readUserByNameOrByEmail } from './readUserByNameOrByEmail';

// Mock the imported modules
jest.mock('../../supabaseClient', () => ({
  USER_TABLE: 'users',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readUserByNameOrByEmail', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a user by name', async () => {
    // Test values
    const name = 'Test User';
    const email = 'unused@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name,
      email: 'actual@example.com', // Different from search email to confirm name search worked
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
    const result = await readUserByNameOrByEmail(name, email);

    // Verify the function called supabase with correct table
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify or was called with correct filter
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${name},email.eq.${email}`);

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
    // Test values
    const name = 'Unused Name';
    const email = 'test@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name: 'Different Name', // Different from search name to confirm email search worked
      email,
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
    const result = await readUserByNameOrByEmail(name, email);

    // Verify the or filter includes both conditions
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${name},email.eq.${email}`);

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);
  });

  it('should return undefined when no user matches name or email', async () => {
    // Test values
    const name = 'Nonexistent User';
    const email = 'nonexistent@example.com';

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
    const result = await readUserByNameOrByEmail(name, email);

    // Verify the expected query was built
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${name},email.eq.${email}`);
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);

    // Verify the result is undefined as expected
    expect(result).toBeUndefined();

    // Verify error handler was not called (function returns undefined directly)
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should filter out users without passwords', async () => {
    // Test values
    const name = 'OAuth User';
    const email = 'oauth@example.com';

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
    const result = await readUserByNameOrByEmail(name, email);

    // Verify the not filter was applied
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);

    // Verify the result is undefined as expected
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    // Test values
    const name = 'Test User';
    const email = 'test@example.com';

    // Mock an exception during execution
    const mockError = new Error('Network error');

    // Setup the mock implementation to throw an error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    // Call the function
    const result = await readUserByNameOrByEmail(name, email);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the exception
    expect(result).toBeUndefined();
  });

  it('should handle special characters in name and email properly', async () => {
    // Test values with special characters
    const name = "O'Connor & Sons";
    const email = 'user+test@example.com';

    // Mock user object that should be returned
    const mockUser = {
      id: 'test-uuid',
      name,
      email,
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
    const result = await readUserByNameOrByEmail(name, email);

    // Verify or was called with exactly the string provided
    // This tests that the function doesn't modify or escape the strings
    expect(mockOr).toHaveBeenCalledWith(`name.eq.${name},email.eq.${email}`);

    // Verify the result matches our mock user
    expect(result).toEqual(mockUser);
  });
});
