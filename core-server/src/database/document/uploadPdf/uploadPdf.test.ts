import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

import { uploadPdf } from './uploadPdf';

// Mock the imported modules
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('uploadPdf', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock file data - keeping it small
  const mockFile: Express.Multer.File = {
    buffer: Buffer.from('test'),
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    size: 100,
    fieldname: 'file',
    encoding: '7bit',
    destination: '',
    filename: 'test.pdf',
    path: '',
    // eslint-disable-next-line
    stream: null as any,
  };

  // Standard file path
  const filePath = 'documents/test.pdf';

  it('should successfully upload a PDF file', async () => {
    // Simplified mock implementation
    (supabaseClient.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({ error: null }),
    });

    await uploadPdf(mockFile, filePath);

    expect(supabaseClient.storage.from).toHaveBeenCalledWith('fylo-pdf');
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle upload errors properly', async () => {
    // Simplified mock implementation
    (supabaseClient.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        error: { message: 'Upload failed' },
      }),
    });

    await uploadPdf(mockFile, filePath);

    expect(handleErrors).toHaveBeenCalledWith(
      'Supabase Error:',
      new Error('File upload failed: Upload failed'),
    );
  });

  it('should handle storage service errors', async () => {
    const mockError = new Error('Storage service unavailable');

    (supabaseClient.storage.from as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    await uploadPdf(mockFile, filePath);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
  });

  it('should handle invalid file buffer', async () => {
    const invalidFile = {
      ...mockFile,
      // eslint-disable-next-line
      buffer: null as any,
    };

    (supabaseClient.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        error: { message: 'Invalid file buffer' },
      }),
    });

    await uploadPdf(invalidFile, filePath);

    expect(handleErrors).toHaveBeenCalledWith(
      'Supabase Error:',
      new Error('File upload failed: Invalid file buffer'),
    );
  });
});
