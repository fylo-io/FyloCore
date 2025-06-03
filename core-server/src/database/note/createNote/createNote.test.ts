import { Note } from '../../../types/note';
import { handleErrors } from '../../../utils/errorHandler';
import { NOTE_TABLE, supabaseClient } from '../../supabaseClient';

import { createNote } from './createNote';

jest.mock('../../supabaseClient', () => ({
  NOTE_TABLE: 'notes',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('createNote', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01'));
  });

  // Restore real timers after tests
  afterAll(() => {
    jest.useRealTimers();
  });

  it('should successfully create a new note', async () => {
    // Test data
    const author = 'test-user';
    const nodeId = 'node-123';
    const text = 'Test note content';

    const mockNote: Note = {
      id: 'note-123',
      created_at: new Date('2023-01-01').toISOString(),
      author,
      node_id: nodeId,
      text,
    };

    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockNote,
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await createNote(author, nodeId, text);

    // Verify the function called supabase with correct table
    expect(mockFrom).toHaveBeenCalledWith(NOTE_TABLE);

    // Verify insert was called with correct data
    expect(mockInsert).toHaveBeenCalledWith([
      {
        created_at: new Date('2023-01-01'),
        author,
        node_id: nodeId,
        text,
      },
    ]);

    // Verify the result matches our mock note
    expect(result).toEqual(mockNote);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database insertion error', async () => {
    // Test data
    const author = 'test-user';
    const nodeId = 'node-123';
    const text = 'Test note content';

    const mockError = new Error('Database insertion error');

    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await createNote(author, nodeId, text);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle invalid node_id', async () => {
    // Test data with invalid node_id
    const author = 'test-user';
    const nodeId = 'invalid-node';
    const text = 'Test note content';

    const mockError = new Error('Foreign key violation');

    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await createNote(author, nodeId, text);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle network errors during creation', async () => {
    // Test data
    const author = 'test-user';
    const nodeId = 'node-123';
    const text = 'Test note content';

    const mockError = new Error('Network error');

    // Mock implementation that throws network error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await createNote(author, nodeId, text);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle empty text content', async () => {
    // Test data with empty text
    const author = 'test-user';
    const nodeId = 'node-123';
    const text = '';

    const mockNote: Note = {
      id: 'note-123',
      created_at: new Date('2023-01-01').toISOString(),
      author,
      node_id: nodeId,
      text,
    };

    const mockInsert = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockNote,
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await createNote(author, nodeId, text);

    // Verify the function succeeds with empty text
    expect(result).toEqual(mockNote);
    expect(result?.text).toBe('');
  });
});
