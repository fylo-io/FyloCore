import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { readNodesByNodeId } from './readNodesByNodeId';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  NODE_TABLE: 'nodes',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readNodesByNodeId', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return a node when found', async () => {
    // Mock data
    const mockNode = { id: 'node-123', name: 'Test Node', type: 'folder' };

    // Setup the mock chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockNode,
      error: null,
    });

    // Setup supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    // Execute function
    const result = await readNodesByNodeId('node-123');

    // Assert supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', 'node-123');
    expect(mockSingle).toHaveBeenCalled();

    // Assert result
    expect(result).toEqual(mockNode);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  test('should handle supabase error', async () => {
    // Mock error
    const mockError = new Error('Database error');

    // Setup the mock chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Setup supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    // Execute function
    const result = await readNodesByNodeId('node-123');

    // Assert error handler was called
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Assert result
    expect(result).toBeUndefined();
  });

  test('should handle unexpected exceptions', async () => {
    // Setup the mock to throw an error
    const unexpectedError = new Error('Unexpected error');
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    // Execute function
    const result = await readNodesByNodeId('node-123');

    // Assert error handler was called
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', unexpectedError);

    // Assert result
    expect(result).toBeUndefined();
  });

  test('should return undefined when node not found', async () => {
    // Setup the mock chain for "not found" scenario
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    // Setup supabase mock
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    // Execute function
    const result = await readNodesByNodeId('non-existent');

    // Assert supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', 'non-existent');

    // Assert result
    expect(result).toBeNull();
    expect(handleErrors).not.toHaveBeenCalled();
  });
});
