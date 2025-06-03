import { Document } from '../../../types/document';
import { handleErrors } from '../../../utils/errorHandler';
import { DocumentContent } from '../../../utils/helpers';
import { DOCUMENT_TABLE, supabaseClient } from '../../supabaseClient';

import { saveDocument } from './saveDocument';

jest.mock('../../supabaseClient', () => ({
  DOCUMENT_TABLE: 'documents',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('saveDocument', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Set longer timeout if needed
  jest.setTimeout(10000);

  it('should successfully save a minimal document', async () => {
    // Minimal document data
    const documentData = {
      title: 'Test Document',
      content: 'Test content',
    };

    // Expected saved document
    const mockSavedDocument: Document = {
      id: 'doc-123',
      created_at: new Date(),
      title: documentData.title,
      content: documentData.content,
    };

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSavedDocument,
            error: null,
          }),
        }),
      }),
    });

    const result = await saveDocument(documentData);

    expect(supabaseClient.from).toHaveBeenCalledWith(DOCUMENT_TABLE);
    expect(result).toEqual(mockSavedDocument);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should successfully save a complete document with all fields', async () => {
    // Complete document data
    const documentData: DocumentContent = {
      title: 'Complete Document',
      content: 'Detailed content',
      source_type: 'journal',
      doi: '10.1234/test',
      publication_year: 2023,
      publication_date: new Date('2023-01-01').toDateString(),
      type: 'research-article',
      is_oa: true,
      oa_status: 'gold',
      authors: ['Author 1', 'Author 2'],
    };

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'doc-456',
              created_at: new Date(),
              ...documentData,
            },
            error: null,
          }),
        }),
      }),
    });

    const result = await saveDocument(documentData);

    expect(supabaseClient.from).toHaveBeenCalledWith(DOCUMENT_TABLE);
    expect(result).toEqual({
      id: 'doc-456',
      created_at: new Date(),
      ...documentData,
    });
    expect(result?.authors).toEqual(documentData.authors);
    expect(result?.doi).toBe(documentData.doi);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database insertion error', async () => {
    const documentData: DocumentContent = {
      title: 'Test Document',
      content: 'Test content',
    };

    const mockError = new Error('Database insertion error');

    // Simplified mock implementation with error
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    const result = await saveDocument(documentData);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle invalid document data', async () => {
    // Invalid document data (missing required fields)
    const invalidDocumentData = {
      source_type: 'journal',
      // missing title and content
    };

    const mockError = new Error('Invalid data');

    // Simplified mock implementation with error
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    });

    const result = await saveDocument(invalidDocumentData as DocumentContent);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle network errors during save operation', async () => {
    const documentData = {
      title: 'Test Document',
      content: 'Test content',
    };

    const mockError = new Error('Network error');

    // Mock implementation that throws error
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await saveDocument(documentData);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should correctly handle optional fields with null values', async () => {
    // Document data with some optional fields as null
    const documentData: DocumentContent = {
      title: 'Test Document',
      content: 'Test content',
      doi: 'abc',
      publication_year: 2000,
      authors: [],
    };

    const mockSavedDocument: Document = {
      id: 'doc-789',
      created_at: new Date(),
      title: documentData.title,
      content: documentData.content,
      // Optional fields should be undefined rather than null
      doi: undefined,
      publication_year: undefined,
      authors: [],
    };

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockSavedDocument,
            error: null,
          }),
        }),
      }),
    });

    const result = await saveDocument(documentData);

    expect(result).toEqual(mockSavedDocument);
    expect(result?.doi).toBeUndefined();
    expect(result?.publication_year).toBeUndefined();
    expect(result?.authors).toEqual([]);
  });
});
