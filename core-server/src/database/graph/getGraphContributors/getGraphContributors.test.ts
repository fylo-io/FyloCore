import { GraphType } from '../../../consts';
import { FyloGraph } from '../../../types/graph';
import { handleErrors } from '../../../utils/errorHandler';
import { supabaseClient } from '../../supabaseClient';

import { getGraphContributors } from './getGraphContributors';

// Mock the dependencies
jest.mock('../../supabaseClient', () => ({
  supabaseClient: {
    from: jest.fn(),
  },
  SHARE_TABLE: 'shares',
  USER_TABLE: 'users',
}));

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

describe('getGraphContributors', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create a complete mock graph that satisfies the FyloGraph interface
  const mockGraph: FyloGraph = {
    id: 'graph123',
    created_at: '2023-01-01T00:00:00Z',
    title: 'Test Graph',
    description: 'A test graph for unit testing',
    creator_id: 'creator456',
    type: GraphType.PRIVATE,
    node_count: 5,
  };

  it('should fetch and return graph contributors successfully', async () => {
    // Mock the share table response
    const mockShareFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ user_id: 'user1' }, { user_id: 'user2' }],
          error: null,
        }),
      }),
    };

    // Mock the user table for owner query
    const mockOwnerFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'creator456',
              name: 'Creator',
              profile_color: 'blue',
              avatar_url: 'creator.jpg',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock the user table for viewer query
    const mockViewerFromObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'user1',
              name: 'User 1',
              profile_color: 'red',
              avatar_url: 'user1.jpg',
            },
            {
              id: 'user2',
              name: 'User 2',
              profile_color: 'green',
              avatar_url: 'user2.jpg',
            },
          ],
          error: null,
        }),
      }),
    };

    // Setup supabase client mocks
    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === 'shares') {
        return mockShareFromObject;
      } else if (table === 'users') {
        // We need to handle both cases of user table access
        // Return different instances to track different calls
        const fromCallCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === 'users',
        ).length;
        return fromCallCount === 1 ? mockOwnerFromObject : mockViewerFromObject;
      }
      return {};
    });

    // Call function and verify results
    const result = await getGraphContributors(mockGraph);

    // Verify supabase calls
    expect(supabaseClient.from).toHaveBeenCalledWith('shares');
    expect(supabaseClient.from).toHaveBeenCalledWith('users');

    // Verify select calls
    expect(mockShareFromObject.select).toHaveBeenCalledWith('user_id');
    expect(mockOwnerFromObject.select).toHaveBeenCalledWith('id, name, profile_color, avatar_url');
    expect(mockViewerFromObject.select).toHaveBeenCalledWith('id, name, profile_color, avatar_url');

    // Verify eq and in calls
    expect(mockShareFromObject.select().eq).toHaveBeenCalledWith('graph_id', 'graph123');
    expect(mockOwnerFromObject.select().eq).toHaveBeenCalledWith('id', 'creator456');
    expect(mockViewerFromObject.select().in).toHaveBeenCalledWith('id', ['user1', 'user2']);

    // Verify result matches expected output
    expect(result).toEqual([
      {
        id: 'creator456',
        name: 'Creator',
        profile_color: 'blue',
        avatar_url: 'creator.jpg',
      },
      {
        id: 'user1',
        name: 'User 1',
        profile_color: 'red',
        avatar_url: 'user1.jpg',
      },
      {
        id: 'user2',
        name: 'User 2',
        profile_color: 'green',
        avatar_url: 'user2.jpg',
      },
    ]);
  });

  it('should handle error when fetching shares', async () => {
    // Mock error in share table query
    const mockShareFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Share query failed'),
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === 'shares') {
        return mockShareFromObject;
      }
      return {};
    });

    const result = await getGraphContributors(mockGraph);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    expect(result).toBeUndefined();
  });

  it('should handle error when fetching owner data', async () => {
    // Mock successful share query but error in owner query
    const mockShareFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ user_id: 'user1' }],
          error: null,
        }),
      }),
    };

    const mockOwnerFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Owner query failed'),
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === 'shares') {
        return mockShareFromObject;
      } else if (table === 'users') {
        return mockOwnerFromObject;
      }
      return {};
    });

    const result = await getGraphContributors(mockGraph);

    expect(handleErrors).toHaveBeenCalledWith('Supabase Error:', expect.any(Error));
    expect(result).toBeUndefined();
  });

  it('should handle empty share results', async () => {
    // Mock empty share results
    const mockShareFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    // Mock the supabase chain for owner query
    const mockOwnerFromObject = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'creator456',
              name: 'Creator',
              profile_color: 'blue',
              avatar_url: 'creator.jpg',
            },
          ],
          error: null,
        }),
      }),
    };

    // Mock the supabase chain for viewers query - this won't be called
    // but we setup to confirm it's not called with empty data
    const mockViewerFromObject = {
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }),
    };

    (supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === 'shares') {
        return mockShareFromObject;
      } else if (table === 'users') {
        // We need to handle both cases of user table access
        // Return different instances to track different calls
        const fromCallCount = (supabaseClient.from as jest.Mock).mock.calls.filter(
          (call) => call[0] === 'users',
        ).length;
        return fromCallCount === 1 ? mockOwnerFromObject : mockViewerFromObject;
      }
      return {};
    });

    const result = await getGraphContributors(mockGraph);

    expect(result).toEqual([
      {
        id: 'creator456',
        name: 'Creator',
        profile_color: 'blue',
        avatar_url: 'creator.jpg',
      },
    ]);
  });
});
