import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { deleteNode } from './deleteNode';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  NODE_TABLE: 'nodes',
  GRAPH_TABLE: 'graphs',
  supabaseClient: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

// Add explicit typing for the mocked handleErrors function
const mockedHandleErrors = handleErrors as jest.MockedFunction<typeof handleErrors>;

describe('deleteNode', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNodeId = 'node-123';
  const mockGraphId = 'graph-456';

  it('should successfully delete a node and update graph node count', async () => {
    // Setup direct spies on supabase methods to track calls
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphSelectEq = jest.fn().mockReturnThis();
    const mockGraphSelectSingle = jest.fn().mockResolvedValue({
      data: { node_count: 5 },
      error: null,
    });

    const mockGraphUpdate = jest.fn().mockReturnThis();
    const mockGraphUpdateEq = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
          update: mockGraphUpdate,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });

    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });

    mockGraphSelect.mockReturnValue({ eq: mockGraphSelectEq });
    mockGraphSelectEq.mockReturnValue({ single: mockGraphSelectSingle });

    mockGraphUpdate.mockReturnValue({ eq: mockGraphUpdateEq });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockNodeSelect).toHaveBeenCalledWith('graph_id');
    expect(mockNodeSelectEq).toHaveBeenCalledWith('id', mockNodeId);

    expect(mockNodeDelete).toHaveBeenCalled();
    expect(mockNodeDeleteEq).toHaveBeenCalledWith('id', mockNodeId);

    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(mockGraphSelect).toHaveBeenCalledWith('node_count');
    expect(mockGraphSelectEq).toHaveBeenCalledWith('id', mockGraphId);

    // Verify the update was called with the correct value (5-1=4)
    expect(mockGraphUpdate).toHaveBeenCalledWith({ node_count: 4 });
    expect(mockGraphUpdateEq).toHaveBeenCalledWith('id', mockGraphId);

    expect(mockedHandleErrors).not.toHaveBeenCalled();
  });

  it('should handle error when node not found', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockNodeSelect).toHaveBeenCalledWith('graph_id');
    expect(mockNodeSelectEq).toHaveBeenCalledWith('id', mockNodeId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    // Use toEqual to check objects instead of trying to access specific properties
    const errorArg = mockedHandleErrors.mock.calls[0][1] as Error;
    expect(errorArg.message).toBe('Node not found or missing graph_id');
  });

  it('should handle error when fetchError occurs', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('Failed to fetch node'),
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockNodeSelect).toHaveBeenCalledWith('graph_id');
    expect(mockNodeSelectEq).toHaveBeenCalledWith('id', mockNodeId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    const errorArg = mockedHandleErrors.mock.calls[0][1] as Error;
    expect(errorArg.message).toBe('Failed to fetch node');
  });

  it('should handle error during node deletion', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: new Error('Failed to delete node'),
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });
    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockNodeDelete).toHaveBeenCalled();
    expect(mockNodeDeleteEq).toHaveBeenCalledWith('id', mockNodeId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    const errorArg = mockedHandleErrors.mock.calls[0][1] as Error;
    expect(errorArg.message).toBe('Failed to delete node');
  });

  it('should handle error when fetching graph data', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphSelectEq = jest.fn().mockReturnThis();
    const mockGraphSelectSingle = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('Failed to fetch graph'),
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });
    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });
    mockGraphSelect.mockReturnValue({ eq: mockGraphSelectEq });
    mockGraphSelectEq.mockReturnValue({ single: mockGraphSelectSingle });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(mockGraphSelect).toHaveBeenCalledWith('node_count');
    expect(mockGraphSelectEq).toHaveBeenCalledWith('id', mockGraphId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    const errorArg = mockedHandleErrors.mock.calls[0][1] as Error;
    expect(errorArg.message).toBe('Failed to fetch graph');
  });

  it('should handle error when updating graph node count', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphSelectEq = jest.fn().mockReturnThis();
    const mockGraphSelectSingle = jest.fn().mockResolvedValue({
      data: { node_count: 5 },
      error: null,
    });

    const mockGraphUpdate = jest.fn().mockReturnThis();
    const mockGraphUpdateEq = jest.fn().mockResolvedValue({
      error: new Error('Failed to update graph'),
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
          update: mockGraphUpdate,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });
    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });
    mockGraphSelect.mockReturnValue({ eq: mockGraphSelectEq });
    mockGraphSelectEq.mockReturnValue({ single: mockGraphSelectSingle });
    mockGraphUpdate.mockReturnValue({ eq: mockGraphUpdateEq });

    // Execute the function
    await deleteNode(mockNodeId);

    // Assertions
    expect(mockGraphUpdate).toHaveBeenCalledWith({ node_count: 4 });
    expect(mockGraphUpdateEq).toHaveBeenCalledWith('id', mockGraphId);
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    const errorArg = mockedHandleErrors.mock.calls[0][1] as Error;
    expect(errorArg.message).toBe('Failed to update graph');
  });

  it('should ensure node_count never goes below 0', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphSelectEq = jest.fn().mockReturnThis();
    const mockGraphSelectSingle = jest.fn().mockResolvedValue({
      data: { node_count: 0 }, // Already at 0
      error: null,
    });

    const mockGraphUpdate = jest.fn().mockReturnThis();
    const mockGraphUpdateEq = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
          update: mockGraphUpdate,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });
    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });
    mockGraphSelect.mockReturnValue({ eq: mockGraphSelectEq });
    mockGraphSelectEq.mockReturnValue({ single: mockGraphSelectSingle });
    mockGraphUpdate.mockReturnValue({ eq: mockGraphUpdateEq });

    // Execute the function
    await deleteNode(mockNodeId);

    // Verify that node_count stays at 0 and doesn't go negative
    expect(mockGraphUpdate).toHaveBeenCalledWith({ node_count: 0 });
  });

  it('should handle null node_count in graph data and default to 0', async () => {
    // Setup direct spies
    const mockNodeSelect = jest.fn().mockReturnThis();
    const mockNodeSelectEq = jest.fn().mockReturnThis();
    const mockNodeSelectSingle = jest.fn().mockResolvedValue({
      data: { graph_id: mockGraphId },
      error: null,
    });

    const mockNodeDelete = jest.fn().mockReturnThis();
    const mockNodeDeleteEq = jest.fn().mockResolvedValue({
      error: null,
    });

    const mockGraphSelect = jest.fn().mockReturnThis();
    const mockGraphSelectEq = jest.fn().mockReturnThis();
    const mockGraphSelectSingle = jest.fn().mockResolvedValue({
      data: { node_count: null }, // Null count
      error: null,
    });

    const mockGraphUpdate = jest.fn().mockReturnThis();
    const mockGraphUpdateEq = jest.fn().mockResolvedValue({
      error: null,
    });

    // Setup the mock chain
    (supabaseClient.from as jest.Mock).mockImplementation((table: string) => {
      if (table === NODE_TABLE) {
        return {
          select: mockNodeSelect,
          delete: mockNodeDelete,
        };
      } else if (table === GRAPH_TABLE) {
        return {
          select: mockGraphSelect,
          update: mockGraphUpdate,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Connect the remaining chains
    mockNodeSelect.mockReturnValue({ eq: mockNodeSelectEq });
    mockNodeSelectEq.mockReturnValue({ single: mockNodeSelectSingle });
    mockNodeDelete.mockReturnValue({ eq: mockNodeDeleteEq });
    mockGraphSelect.mockReturnValue({ eq: mockGraphSelectEq });
    mockGraphSelectEq.mockReturnValue({ single: mockGraphSelectSingle });
    mockGraphUpdate.mockReturnValue({ eq: mockGraphUpdateEq });

    // Execute the function
    await deleteNode(mockNodeId);

    // Verify that the function handles null values correctly (1-1=0)
    expect(mockGraphUpdate).toHaveBeenCalledWith({ node_count: 0 });
  });
});
