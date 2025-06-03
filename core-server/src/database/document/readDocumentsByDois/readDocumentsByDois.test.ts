import { Document } from '../../../types/document';
import { handleErrors } from '../../../utils/errorHandler';
import { DOCUMENT_TABLE, supabaseClient } from '../../supabaseClient';

import { readDocumentsByDois } from './readDocumentsByDois';

jest.mock('../../supabaseClient', () => ({
  DOCUMENT_TABLE: 'documents',
  supabaseClient: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readDocumentsByDois', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Increase timeout if needed
  jest.setTimeout(10000);

  it('should successfully retrieve documents by DOIs', async () => {
    const testDois = ['10.1234/test.1', '10.1234/test.2'];

    const mockDocuments: Document[] = [
      {
        id: 'doc-1',
        created_at: new Date(),
        title: 'Test Document 1',
        content: 'Test content 1',
        doi: '10.1234/test.1',
        publication_year: 2023,
        publication_date: new Date('2023-01-01'),
        type: 'article',
        is_oa: true,
        oa_status: 'gold',
        authors: ['Author 1', 'Author 2'],
        pdf_url: 'https://example.com/pdf1.pdf',
      },
      {
        id: 'doc-2',
        created_at: new Date(),
        title: 'Test Document 2',
        content: 'Test content 2',
        doi: '10.1234/test.2',
        publication_year: 2022,
        source_type: 'journal',
      },
    ];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: mockDocuments,
          error: null,
        }),
      }),
    });

    const result = await readDocumentsByDois(testDois);

    expect(supabaseClient.from).toHaveBeenCalledWith(DOCUMENT_TABLE);
    expect(result).toEqual(mockDocuments);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should return empty array when no documents match the DOIs', async () => {
    const testDois = ['10.1234/nonexistent.1'];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const result = await readDocumentsByDois(testDois);

    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle database errors properly', async () => {
    const testDois = ['10.1234/test.1'];
    const mockError = new Error('Database connection error');

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    });

    const result = await readDocumentsByDois(testDois);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle exceptions during the database operation', async () => {
    const testDois = ['10.1234/test.1'];
    const mockError = new Error('Network error');

    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const result = await readDocumentsByDois(testDois);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle documents with varying optional fields', async () => {
    const testDois = ['10.1234/test.1', '10.1234/test.2', '10.1234/test.3'];

    const mockDocuments: Document[] = [
      {
        // Document with all fields
        id: 'doc-1',
        created_at: new Date(),
        title: 'Complete Document',
        content: 'Complete content',
        source_type: 'journal',
        doi: '10.1234/test.1',
        publication_year: 2023,
        publication_date: new Date('2023-01-01'),
        type: 'article',
        is_oa: true,
        oa_status: 'gold',
        authors: ['Author 1', 'Author 2'],
        pdf_url: 'https://example.com/pdf1.pdf',
      },
      {
        // Document with minimal fields
        id: 'doc-2',
        created_at: new Date(),
        title: 'Minimal Document',
        content: 'Minimal content',
        doi: '10.1234/test.2',
      },
      {
        // Document with some optional fields
        id: 'doc-3',
        created_at: new Date(),
        title: 'Partial Document',
        content: 'Partial content',
        doi: '10.1234/test.3',
        publication_year: 2022,
        authors: ['Author 3'],
      },
    ];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: mockDocuments,
          error: null,
        }),
      }),
    });

    const result = await readDocumentsByDois(testDois);

    expect(result).toEqual(mockDocuments);

    // Verify different combinations of optional fields
    expect(result?.[0].source_type).toBeDefined();
    expect(result?.[0].publication_date).toBeDefined();
    expect(result?.[0].authors).toBeDefined();

    expect(result?.[1].source_type).toBeUndefined();
    expect(result?.[1].publication_date).toBeUndefined();
    expect(result?.[1].authors).toBeUndefined();

    expect(result?.[2].publication_year).toBeDefined();
    expect(result?.[2].source_type).toBeUndefined();
    expect(result?.[2].is_oa).toBeUndefined();
  });

  it('should handle empty DOIs array', async () => {
    const emptyDois: string[] = [];

    // Simplified mock implementation
    (supabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    });

    const result = await readDocumentsByDois(emptyDois);

    expect(result).toEqual([]);
    expect(handleErrors).not.toHaveBeenCalled();
  });
});
