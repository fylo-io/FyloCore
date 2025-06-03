import { UserProfile } from '../../../types/user';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { readUserProfiles } from './readUserProfiles';

jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  USER_TABLE: 'User',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readUserProfiles', () => {
  // Mock data for testing
  const mockUserProfiles: UserProfile[] = [
    { id: 'user-1', name: 'John Doe', profile_color: '#FF5733' },
    { id: 'user-2', name: 'Jane Smith', profile_color: '#33FF57' },
    { id: 'user-3', name: 'Bob Johnson', profile_color: '#5733FF' },
  ];

  // Setup mock return values
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup the Supabase method chain mocks
    mockSelect = jest.fn();
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    // Assign mock implementation
    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);
  });

  test('should return user profiles when the query is successful', async () => {
    // Mock successful response
    mockSelect.mockResolvedValue({
      data: mockUserProfiles,
      error: null,
    });

    // Call the function
    const result = await readUserProfiles();

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('id, name, profile_color');
    expect(result).toEqual(mockUserProfiles);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should return undefined and handle errors when the query fails', async () => {
    // Mock error response
    const testError = new Error('Database query failed');
    mockSelect.mockResolvedValue({
      data: null,
      error: testError,
    });

    // Call the function
    const result = await readUserProfiles();

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('id, name, profile_color');
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', testError);
  });

  test('should handle unexpected exceptions', async () => {
    // Mock implementation that throws an error
    mockSelect.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    // Call the function
    const result = await readUserProfiles();

    // Assertions
    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
  });

  test('should return empty array when no users exist', async () => {
    // Mock empty response
    mockSelect.mockResolvedValue({
      data: [],
      error: null,
    });

    // Call the function
    const result = await readUserProfiles();

    // Assertions
    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should call Supabase with the correct table name', async () => {
    // Mock successful response
    mockSelect.mockResolvedValue({
      data: mockUserProfiles,
      error: null,
    });

    // Call the function
    await readUserProfiles();

    // Check that the correct table name is used
    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
  });

  test('should select only the required user profile fields', async () => {
    // Mock successful response
    mockSelect.mockResolvedValue({
      data: mockUserProfiles,
      error: null,
    });

    // Call the function
    await readUserProfiles();

    // Check that only required fields are selected
    expect(mockSelect).toHaveBeenCalledWith('id, name, profile_color');
  });
});
