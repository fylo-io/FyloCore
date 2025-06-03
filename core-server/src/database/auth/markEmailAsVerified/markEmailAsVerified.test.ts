import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { markEmailAsVerified } from './markEmailAsVerified';

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

describe('markEmailAsVerified', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully mark an email as verified', async () => {
    // Mock user data
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      verified: true,
      name: 'Test User',
    };

    // Set up the complete Supabase mock chain
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockNot = jest.fn().mockReturnValue({ select: mockSelect });
    const mockEq = jest.fn().mockReturnValue({ not: mockNot });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Call the function
    const result = await markEmailAsVerified('test@example.com');

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockUpdate).toHaveBeenCalledWith({ verified: true });
    expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
    expect(mockNot).toHaveBeenCalledWith('password', 'is', null);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle errors when Supabase operation fails', async () => {
    // Set up the error case
    const mockError = new Error('Database error');

    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockNot = jest.fn().mockReturnValue({ select: mockSelect });
    const mockEq = jest.fn().mockReturnValue({ not: mockNot });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Call the function
    const result = await markEmailAsVerified('test@example.com');

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle unexpected exceptions', async () => {
    // Set up an exception case
    const mockException = new Error('Unexpected error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockException;
    });

    // Call the function
    const result = await markEmailAsVerified('test@example.com');

    // Assertions
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockException);
    expect(result).toBeUndefined();
  });

  it('should call single() method to get a single result', async () => {
    // Mock user data
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      verified: true,
      name: 'Test User',
    };

    // Set up the Supabase mock chain with single method
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockUser,
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockNot = jest.fn().mockReturnValue({ select: mockSelect });
    const mockEq = jest.fn().mockReturnValue({ not: mockNot });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    // Call the function
    const result = await markEmailAsVerified('test@example.com');

    // Assertions
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });
});
