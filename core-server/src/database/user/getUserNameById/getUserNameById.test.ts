import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { getUserNameById } from './getUserNameById';

jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  USER_TABLE: 'User',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('getUserNameById', () => {
  // Mock data for testing
  const mockUserId = 'user-123';
  const mockUserName = 'John Doe';

  // Setup mock return values - create once, reuse throughout
  const mockSingle = jest.fn();
  const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

  beforeAll(() => {
    // Assign mock implementation once for all tests
    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);
  });

  beforeEach(() => {
    // Only reset the mock calls and results, not the implementation
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up any global mocks
    jest.restoreAllMocks();
  });

  test('should return username when user is found', async () => {
    // Mock successful response
    mockSingle.mockResolvedValueOnce({
      data: { name: mockUserName },
      error: null,
    });

    // Call the function
    const result = await getUserNameById(mockUserId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('name');
    expect(mockEq).toHaveBeenCalledWith('id', mockUserId);
    expect(result).toEqual(mockUserName);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should return undefined when user is not found', async () => {
    // Mock not found error
    const notFoundError = new Error('User not found');
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: notFoundError,
    });

    // Call the function
    const result = await getUserNameById(mockUserId);

    // Assertions
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalled();
  });

  test('should handle various username edge cases', async () => {
    // Define test cases
    const testCases = [
      { name: 'empty string', value: '', expected: '' },
      { name: 'null', value: null, expected: null },
      { name: 'undefined', value: undefined, expected: undefined },
      {
        name: 'special characters',
        value: 'Séñor Developer',
        expected: 'Séñor Developer',
      },
    ];

    // Run all test cases in a single test
    for (const { value, expected } of testCases) {
      // Reset specific mocks
      mockSingle.mockReset();

      // Mock response
      mockSingle.mockResolvedValueOnce({
        data: { name: value },
        error: null,
      });

      // Call function
      const result = await getUserNameById(mockUserId);

      // Verify
      expect(result).toBe(expected);
    }
  });

  test('should handle empty and invalid userId inputs', async () => {
    // Define test cases
    const testCases = ['', null, undefined];

    for (const id of testCases) {
      // Reset mocks
      mockSingle.mockReset();
      mockSingle.mockResolvedValueOnce({
        data: { name: mockUserName },
        error: null,
      });

      // Call with various ID types
      await getUserNameById(id as string);

      // Verify ID is passed through
      expect(mockEq).toHaveBeenCalledWith('id', id);
    }
  });

  test('should handle various error conditions', async () => {
    // Define error test cases
    const errorTestCases = [
      {
        name: 'database error',
        error: new Error('Database error'),
        mockImplementation: (err: Error) => mockSingle.mockRejectedValueOnce(err),
      },
      {
        name: 'null data',
        error: null,
        mockImplementation: () =>
          mockSingle.mockResolvedValueOnce({
            data: null,
            error: null,
          }),
      },
      {
        name: 'missing name field',
        error: null,
        mockImplementation: () =>
          mockSingle.mockResolvedValueOnce({
            data: { id: mockUserId }, // name field missing
            error: null,
          }),
      },
    ];

    for (const { error, mockImplementation } of errorTestCases) {
      // Reset mocks
      jest.clearAllMocks();

      // Setup mock
      mockImplementation(error as Error);

      // Call function
      const result = await getUserNameById(mockUserId);

      // All error cases should return undefined
      expect(result).toBeUndefined();
    }
  });

  test('should call Supabase with correct table and field selection', async () => {
    // Mock successful response
    mockSingle.mockResolvedValueOnce({
      data: { name: mockUserName },
      error: null,
    });

    // Call the function
    await getUserNameById(mockUserId);

    // Verify correct parameters
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('name');
  });
});
