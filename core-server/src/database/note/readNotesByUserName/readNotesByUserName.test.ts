import { Note } from '../../../types/note';
import { handleErrors } from '../../../utils/errorHandler';
import { NOTE_TABLE, supabaseClient } from '../../supabaseClient';

import { readNotesByUserName } from './readNotesByUserName';

// Mock the imported modules
jest.mock('../../supabaseClient', () => ({
  NOTE_TABLE: 'notes',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readNotesByUserName', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve notes for a user', async () => {
    // Test data
    const userName = 'testUser';

    const mockNotes: Note[] = [
      {
        id: 'note-1',
        created_at: new Date('2023-01-01').toISOString(),
        author: userName,
        node_id: 'node-123',
        text: 'First note',
      },
      {
        id: 'note-2',
        created_at: new Date('2023-01-02').toISOString(),
        author: userName,
        node_id: 'node-456',
        text: 'Second note',
      },
    ];

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: mockNotes,
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await readNotesByUserName(userName);

    // Verify the function called supabase with correct table
    expect(mockFrom).toHaveBeenCalledWith(NOTE_TABLE);

    // Verify select was called with *
    expect(mockSelect).toHaveBeenCalledWith('*');

    // Verify eq was called with correct arguments
    expect(mockEq).toHaveBeenCalledWith('author', userName);

    // Verify the result matches our mock notes
    expect(result).toEqual(mockNotes);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return empty array when user has no notes', async () => {
    // Test data
    const userName = 'userWithNoNotes';

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await readNotesByUserName(userName);

    // Verify the function behavior
    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    // Test data
    const userName = 'testUser';

    const mockError = new Error('Database error');

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await readNotesByUserName(userName);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle network errors', async () => {
    // Test data
    const userName = 'testUser';

    const mockError = new Error('Network error');

    // Mock implementation that throws network error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await readNotesByUserName(userName);

    // Verify error handler was called with the correct error
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);

    // Verify the result is undefined due to the error
    expect(result).toBeUndefined();
  });

  it('should handle case-sensitive username matching', async () => {
    // Test data
    const userName = 'TestUser';
    const lowerCaseNotes: Note[] = [
      {
        id: 'note-1',
        created_at: new Date('2023-01-01').toISOString(),
        author: 'TestUser', // Exact match
        node_id: 'node-123',
        text: 'Case sensitive note',
      },
    ];

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: lowerCaseNotes,
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await readNotesByUserName(userName);

    // Verify exact match of username
    expect(result).toEqual(lowerCaseNotes);
    expect(mockEq).toHaveBeenCalledWith('author', 'TestUser');
  });

  it('should handle multiple notes with different timestamps', async () => {
    // Test data
    const userName = 'testUser';
    const mockNotes: Note[] = [
      {
        id: 'note-1',
        created_at: new Date('2023-01-01T10:00:00Z').toISOString(),
        author: userName,
        node_id: 'node-123',
        text: 'First note',
      },
      {
        id: 'note-2',
        created_at: new Date('2023-01-01T11:00:00Z').toISOString(),
        author: userName,
        node_id: 'node-456',
        text: 'Second note',
      },
      {
        id: 'note-3',
        created_at: new Date('2023-01-01T12:00:00Z').toISOString(),
        author: userName,
        node_id: 'node-789',
        text: 'Third note',
      },
    ];

    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockResolvedValue({
      data: mockNotes,
      error: null,
    });

    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);

    const result = await readNotesByUserName(userName);

    // Verify all notes are returned
    expect(result).toEqual(mockNotes);
    expect(result?.length).toBe(3);

    // Verify chronological order (if your implementation maintains order)
    if (result) {
      const timestamps = result.map((note) => new Date(note.created_at).getTime());
      const isSorted = timestamps.every((val, idx, arr) => !idx || arr[idx - 1] <= val);
      expect(isSorted).toBe(true);
    }
  });
});
