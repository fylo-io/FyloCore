import { FyloNode } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { NODE_TABLE, supabaseClient } from '../../supabaseClient';

import { saveNodePositions } from './saveNodePositions';

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

describe('saveNodePositions', () => {
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;

  // Create a complete FyloNode factory function that matches the actual interface
  const createTestNode = (id: string, x: number, y: number): FyloNode => ({
    id,
    position: { x, y },
    created_at: new Date().toISOString(),
    graph_id: 'test-graph-id',
    type: 'default',
    data: {
      id: `data-${id}`,
      description: 'Test description',
      node_type: 'test',
      is_moving: false,
      picker_color: '#000000',
      is_root: false,
      document_content: 'Test content',
      comments: [],
      confidence_score: 0.8,
    },
  });

  beforeEach(() => {
    // Setup mock chain
    mockEq = jest.fn().mockReturnValue({ error: null });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

    (supabaseClient.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should update positions for all nodes successfully', async () => {
    // Test data with complete FyloNode objects
    const testNodes: FyloNode[] = [createTestNode('1', 100, 200), createTestNode('2', 300, 400)];

    await saveNodePositions(testNodes);

    // Verify supabase was called correctly for each node
    expect(supabaseClient.from).toHaveBeenCalledTimes(2);
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);

    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(mockUpdate).toHaveBeenCalledWith({ position: testNodes[0].position });
    expect(mockUpdate).toHaveBeenCalledWith({ position: testNodes[1].position });

    expect(mockEq).toHaveBeenCalledTimes(2);
    expect(mockEq).toHaveBeenCalledWith('id', testNodes[0].id);
    expect(mockEq).toHaveBeenCalledWith('id', testNodes[1].id);

    // Verify error handler was not called
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should handle errors when updating node positions', async () => {
    // Test data with complete FyloNode
    const testNodes: FyloNode[] = [createTestNode('1', 100, 200)];
    const testError = new Error('Database update failed');

    // Mock error for this test
    mockEq.mockReturnValue({ error: testError });

    await saveNodePositions(testNodes);

    // Verify error was properly handled
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', testError);
  });

  it('should handle empty nodes array', async () => {
    await saveNodePositions([]);

    // No supabase calls should be made
    expect(supabaseClient.from).not.toHaveBeenCalled();
    expect(handleErrors).not.toHaveBeenCalled();
  });

  it('should stop processing after encountering an error', async () => {
    // Test data with two nodes
    const testNodes: FyloNode[] = [createTestNode('1', 100, 200), createTestNode('2', 300, 400)];

    // Make the first node fail
    const testError = new Error('Failed on node 1');
    mockEq.mockReturnValue({ error: testError });

    await saveNodePositions(testNodes);

    // Verify only the first node was attempted because an error occurred
    expect(supabaseClient.from).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockEq).toHaveBeenCalledTimes(1);

    // Verify calls were made with correct data for the first node only
    expect(supabaseClient.from).toHaveBeenCalledWith(NODE_TABLE);
    expect(mockUpdate).toHaveBeenCalledWith({ position: testNodes[0].position });
    expect(mockEq).toHaveBeenCalledWith('id', testNodes[0].id);

    // Verify error was handled
    expect(handleErrors).toHaveBeenCalledTimes(1);
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', testError);
  });
});
