import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { updateNode } from './updateNode';

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

describe('updateNode', () => {
  // Setup mock data
  const mockFyloNode: FyloNode = {
    id: 'node-123',
    created_at: '2023-01-01T00:00:00Z',
    graph_id: 'graph-456',
    type: 'default',
    position: { x: 100, y: 200 },
    data: {
      id: 'data-123',
      description: 'Test Node',
      node_type: 'evidence',
      document_content: 'Some content',
    },
    measured: { width: 200, height: 150 },
  };

  const mockUpdateResponse = {
    data: { ...mockFyloNode, data: { ...mockFyloNode.data, description: 'Updated Node' } },
    error: null,
  };

  // Mock Supabase client chain
  let mockSingle: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockFrom: jest.Mock;

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase client mock implementation with full chain
    mockSingle = jest.fn().mockResolvedValue(mockUpdateResponse);
    mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabaseClient.from as jest.Mock).mockImplementation(mockFrom);
  });

  it('should successfully update a node', async () => {
    // Execute the function
    const result = await updateNode(mockFyloNode);

    // Verify Supabase chain was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockUpdate).toHaveBeenCalledWith({ ...mockFyloNode });
    expect(mockEq).toHaveBeenCalledWith('id', mockFyloNode.id);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockSingle).toHaveBeenCalled();

    // Verify return result
    expect(result).toEqual(mockUpdateResponse.data);

    // Verify handleErrors was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle Supabase errors', async () => {
    // Mock Supabase error response
    const errorResponse = {
      data: null,
      error: new Error('Supabase update failed'),
    };

    // Override the single method to return error
    mockSingle.mockResolvedValue(errorResponse);

    // Execute the function
    const result = await updateNode(mockFyloNode);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', errorResponse.error);

    // Verify return value is undefined
    expect(result).toBeUndefined();
  });

  it('should handle unexpected exceptions', async () => {
    // Mock Supabase throwing an exception
    (supabaseClient.from as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    // Execute the function
    const result = await updateNode(mockFyloNode);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));

    // Verify return value is undefined
    expect(result).toBeUndefined();
  });
});
