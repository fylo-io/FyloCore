import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient, USER_TABLE } from '../../supabaseClient';

import { getUserIdByName } from './getUserIdByName';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  USER_TABLE: 'users',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('getUserIdByName', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock implementation setup
  const mockSelect = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();

  // Set up the chained mock functions
  beforeEach(() => {
    mockSingle.mockImplementation(() => ({
      data: { id: 'user-123' },
      error: null,
    }));
    mockEq.mockImplementation(() => ({ single: mockSingle }));
    mockSelect.mockImplementation(() => ({ eq: mockEq }));
    (supabaseClient.from as jest.Mock).mockImplementation(() => ({
      select: mockSelect,
    }));
  });

  it('should call supabase with correct parameters', async () => {
    await getUserIdByName('TestUser');

    expect(supabaseClient.from).toHaveBeenCalledWith(USER_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockEq).toHaveBeenCalledWith('name', 'TestUser');
    expect(mockSingle).toHaveBeenCalled();
  });

  it('should return user id when found', async () => {
    const result = await getUserIdByName('TestUser');

    expect(result).toBe('user-123');
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle errors properly when supabase returns an error', async () => {
    const error = new Error('Supabase error');
    mockSingle.mockImplementation(() => ({
      data: null,
      error,
    }));

    const result = await getUserIdByName('TestUser');

    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', error);
  });

  it('should handle errors thrown during the request', async () => {
    const error = new Error('Network error');
    mockSingle.mockImplementation(() => {
      throw error;
    });

    const result = await getUserIdByName('TestUser');

    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', error);
  });

  it('should return undefined for nonexistent users', async () => {
    mockSingle.mockImplementation(() => ({
      data: null,
      error: { message: 'No data found' },
    }));

    const result = await getUserIdByName('NonexistentUser');

    expect(result).toBeUndefined();
    expect(handleErrors).toHaveBeenCalled();
  });

  it('should handle edge case with empty username', async () => {
    await getUserIdByName('');

    expect(mockEq).toHaveBeenCalledWith('name', '');
  });
});
