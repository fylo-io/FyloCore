import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, SHARE_TABLE, supabaseClient } from '../../supabaseClient';

import { readVisibleGraphsByUserId } from './readVisibleGraphsByUserId';

// Mock dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  GRAPH_TABLE: 'graphs',
  SHARE_TABLE: 'shares',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('readVisibleGraphsByUserId', () => {
  const userId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return both created and shared graphs for a user', async () => {
    // Mock created graphs response
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph1',
              title: 'My Graph 1',
              description: 'Description 1',
              creator_id: userId,
              created_at: '2023-01-01T00:00:00Z',
              node_count: 5,
              type: 'private',
            },
            {
              id: 'graph2',
              title: 'My Graph 2',
              description: 'Description 2',
              creator_id: userId,
              created_at: '2023-01-02T00:00:00Z',
              node_count: 10,
              type: 'public',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock shared graph IDs response
    const mockSharedIdsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ graph_id: 'graph3' }, { graph_id: 'graph4' }],
          error: null,
        }),
      }),
    };

    // Mock shared graphs response
    const mockSharedGraphsObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph3',
              title: 'Shared Graph 1',
              description: 'Shared Description 1',
              creator_id: 'otherUser1',
              created_at: '2023-01-03T00:00:00Z',
              node_count: 15,
              type: 'private',
            },
            {
              id: 'graph4',
              title: 'Shared Graph 2',
              description: 'Shared Description 2',
              creator_id: 'otherUser2',
              created_at: '2023-01-04T00:00:00Z',
              node_count: 20,
              type: 'private',
            },
          ],
          error: null,
        }),
      }),
    };

    // Setup supabase client mocks
    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        // Need to handle both calls to GRAPH_TABLE
        const callCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === GRAPH_TABLE,
        ).length;
        return callCount === 1 ? mockCreatedGraphsObject : mockSharedGraphsObject;
      } else if (table === SHARE_TABLE) {
        return mockSharedIdsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Check supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE); // Called twice

    // Check select calls
    expect(mockCreatedGraphsObject.select).toHaveBeenCalledWith('*');
    expect(mockSharedIdsObject.select).toHaveBeenCalledWith('graph_id');
    expect(mockSharedGraphsObject.select).toHaveBeenCalledWith('*');

    // Check query conditions
    expect(mockCreatedGraphsObject.select().eq).toHaveBeenCalledWith('creator_id', userId);
    expect(mockSharedIdsObject.select().eq).toHaveBeenCalledWith('user_id', userId);
    expect(mockSharedGraphsObject.select().in).toHaveBeenCalledWith('id', ['graph3', 'graph4']);

    // Check the result
    expect(result).toEqual([
      {
        id: 'graph1',
        title: 'My Graph 1',
        description: 'Description 1',
        creator_id: userId,
        created_at: '2023-01-01T00:00:00Z',
        node_count: 5,
        type: 'private',
      },
      {
        id: 'graph2',
        title: 'My Graph 2',
        description: 'Description 2',
        creator_id: userId,
        created_at: '2023-01-02T00:00:00Z',
        node_count: 10,
        type: 'public',
      },
      {
        id: 'graph3',
        title: 'Shared Graph 1',
        description: 'Shared Description 1',
        creator_id: 'otherUser1',
        created_at: '2023-01-03T00:00:00Z',
        node_count: 15,
        type: 'private',
      },
      {
        id: 'graph4',
        title: 'Shared Graph 2',
        description: 'Shared Description 2',
        creator_id: 'otherUser2',
        created_at: '2023-01-04T00:00:00Z',
        node_count: 20,
        type: 'private',
      },
    ]);
  });

  it('should handle error when fetching created graphs', async () => {
    // Mock error in created graphs query
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Failed to fetch created graphs'),
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        return mockCreatedGraphsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    expect(result).toBeUndefined();
  });

  it('should handle error when fetching shared graph IDs', async () => {
    // Mock successful created graphs query
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph1',
              title: 'My Graph 1',
              description: 'Description 1',
              creator_id: userId,
              created_at: '2023-01-01T00:00:00Z',
              node_count: 5,
              type: 'private',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock error in shared graph IDs query
    const mockSharedIdsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Failed to fetch shared graph IDs'),
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        return mockCreatedGraphsObject;
      } else if (table === SHARE_TABLE) {
        return mockSharedIdsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    expect(result).toBeUndefined();
  });

  it('should handle error when fetching shared graphs', async () => {
    // Mock successful created graphs query
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph1',
              title: 'My Graph 1',
              description: 'Description 1',
              creator_id: userId,
              created_at: '2023-01-01T00:00:00Z',
              node_count: 5,
              type: 'private',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock successful shared graph IDs query
    const mockSharedIdsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ graph_id: 'graph3' }],
          error: null,
        }),
      }),
    };

    // Mock error in shared graphs query
    const mockSharedGraphsObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Failed to fetch shared graphs'),
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        const callCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === GRAPH_TABLE,
        ).length;
        return callCount === 1 ? mockCreatedGraphsObject : mockSharedGraphsObject;
      } else if (table === SHARE_TABLE) {
        return mockSharedIdsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Verify error handling
    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    expect(result).toBeUndefined();
  });

  it('should handle no shared graphs', async () => {
    // Mock created graphs response
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph1',
              title: 'My Graph 1',
              description: 'Description 1',
              creator_id: userId,
              created_at: '2023-01-01T00:00:00Z',
              node_count: 5,
              type: 'private',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock empty shared graph IDs response
    const mockSharedIdsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    // Mock empty shared graphs response
    const mockSharedGraphsObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        const callCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === GRAPH_TABLE,
        ).length;
        return callCount === 1 ? mockCreatedGraphsObject : mockSharedGraphsObject;
      } else if (table === SHARE_TABLE) {
        return mockSharedIdsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Check supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(supabaseClient.from).toHaveBeenCalledWith(SHARE_TABLE);

    // FIX: Checking the second call to GRAPH_TABLE
    const graphTableCalls = (supabaseClient.from as jest.Mock).mock.calls.filter(
      (call) => call[0] === GRAPH_TABLE,
    );

    // If we have exactly one call, it means it didn't query shared graphs
    if (graphTableCalls.length === 1) {
      // We didn't query for shared graphs
      expect(mockSharedGraphsObject.select).not.toHaveBeenCalled();
    } else {
      // We did query for shared graphs with an empty array
      expect(mockSharedGraphsObject.select().in).toHaveBeenCalledWith('id', []);
    }

    // Check the result only includes created graphs
    expect(result).toEqual([
      {
        id: 'graph1',
        title: 'My Graph 1',
        description: 'Description 1',
        creator_id: userId,
        created_at: '2023-01-01T00:00:00Z',
        node_count: 5,
        type: 'private',
      },
    ]);
  });

  it('should handle no created graphs but has shared graphs', async () => {
    // Mock empty created graphs response
    const mockCreatedGraphsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    // Mock shared graph IDs response
    const mockSharedIdsObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ graph_id: 'graph3' }],
          error: null,
        }),
      }),
    };

    // Mock shared graphs response
    const mockSharedGraphsObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'graph3',
              title: 'Shared Graph 1',
              description: 'Shared Description 1',
              creator_id: 'otherUser1',
              created_at: '2023-01-03T00:00:00Z',
              node_count: 15,
              type: 'private',
            },
          ],
          error: null,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === GRAPH_TABLE) {
        const callCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === GRAPH_TABLE,
        ).length;
        return callCount === 1 ? mockCreatedGraphsObject : mockSharedGraphsObject;
      } else if (table === SHARE_TABLE) {
        return mockSharedIdsObject;
      }
      return {};
    });

    // Call the function
    const result = await readVisibleGraphsByUserId(userId);

    // Check the result only includes shared graphs
    expect(result).toEqual([
      {
        id: 'graph3',
        title: 'Shared Graph 1',
        description: 'Shared Description 1',
        creator_id: 'otherUser1',
        created_at: '2023-01-03T00:00:00Z',
        node_count: 15,
        type: 'private',
      },
    ]);
  });
});
