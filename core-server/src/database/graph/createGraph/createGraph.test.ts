import { GraphType } from '../../../consts';
import { handleErrors } from '../../../utils/errorHandler';
import { GRAPH_TABLE, supabaseClient } from '../../supabaseClient';

import { createGraph } from './createGraph';

// Define proper types for our mock
type MockFn = jest.Mock & { mockReturnThis: () => MockFn };
interface MockChain {
  from: MockFn;
  insert: MockFn;
  select: MockFn;
  single: MockFn;
}

// Properly typed mock
jest.mock('../../supabaseClient', () => {
  // Create a properly typed mock
  const createMockFn = (): MockFn => {
    const fn = jest.fn(() => mockChain) as MockFn;
    fn.mockReturnThis = () => fn;
    return fn;
  };

  // Create the mock chain with proper typing
  const mockChain: MockChain = {
    from: createMockFn(),
    insert: createMockFn(),
    select: createMockFn(),
    single: createMockFn(),
  };

  return {
    GRAPH_TABLE: 'graphs',
    supabaseClient: mockChain,
  };
});

jest.mock('../../../utils/errorHandler', () => ({
  handleErrors: jest.fn(),
}));

jest.mock('../../../consts', () => ({
  ADMINS: ['admin1', 'admin2'],
  GraphType: {
    PUBLIC: 'public',
    PRIVATE: 'private',
  },
}));

// Cast the mocked module to the proper type to avoid TypeScript errors
const mockedSupabaseClient = supabaseClient as unknown as MockChain;
const mockedHandleErrors = handleErrors as jest.Mock;

describe('createGraph', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the behavior of our mocks to return the mock chain
    Object.values(mockedSupabaseClient).forEach((fn) => {
      fn.mockReturnThis();
    });
  });

  it('should create a public graph if creator is an admin', async () => {
    // Arrange
    const mockResponse = {
      data: {
        id: '123',
        created_at: '2023-01-01T00:00:00Z',
        title: 'Test Graph',
        description: 'Test Description',
        creator_id: 'admin1',
        type: GraphType.PUBLIC,
        node_count: 0,
        contributors: [{ name: 'Admin User', profile_color: '#123456' }],
      },
      error: null,
    };

    mockedSupabaseClient.single.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createGraph(
      'Test Graph',
      'Test Description',
      'admin1',
      'Admin User',
      '#123456',
    );

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(mockedSupabaseClient.insert).toHaveBeenCalledWith([
      {
        title: 'Test Graph',
        description: 'Test Description',
        creator_id: 'admin1',
        source_graph_id: undefined,
        type: GraphType.PUBLIC,
        contributors: [{ name: 'Admin User', profile_color: '#123456' }],
      },
    ]);
    expect(mockedSupabaseClient.select).toHaveBeenCalledWith('*');
    expect(mockedSupabaseClient.single).toHaveBeenCalled();
    expect(result).toEqual(mockResponse.data);
  });

  it('should create a private graph if creator is not an admin', async () => {
    // Arrange
    const mockResponse = {
      data: {
        id: '456',
        created_at: '2023-01-01T00:00:00Z',
        title: 'Regular User Graph',
        description: 'Regular Description',
        creator_id: 'regular1',
        type: GraphType.PRIVATE,
        node_count: 0,
        contributors: [{ name: 'Regular User', profile_color: '#654321' }],
      },
      error: null,
    };

    mockedSupabaseClient.single.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createGraph(
      'Regular User Graph',
      'Regular Description',
      'regular1',
      'Regular User',
      '#654321',
    );

    // Assert
    expect(mockedSupabaseClient.from).toHaveBeenCalledWith(GRAPH_TABLE);
    expect(mockedSupabaseClient.insert).toHaveBeenCalledWith([
      {
        title: 'Regular User Graph',
        description: 'Regular Description',
        creator_id: 'regular1',
        source_graph_id: undefined,
        type: GraphType.PRIVATE,
        contributors: [{ name: 'Regular User', profile_color: '#654321' }],
      },
    ]);
    expect(result).toEqual(mockResponse.data);
  });

  it('should include source_graph_id when provided', async () => {
    // Arrange
    const mockResponse = {
      data: {
        id: '789',
        created_at: '2023-01-01T00:00:00Z',
        title: 'Forked Graph',
        description: 'Forked Description',
        creator_id: 'user1',
        source_graph_id: 'source123',
        type: GraphType.PRIVATE,
        node_count: 0,
        contributors: [{ name: 'Some User', profile_color: '#abcdef' }],
      },
      error: null,
    };

    mockedSupabaseClient.single.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createGraph(
      'Forked Graph',
      'Forked Description',
      'user1',
      'Some User',
      '#abcdef',
      'source123',
    );

    // Assert
    expect(mockedSupabaseClient.insert).toHaveBeenCalledWith([
      {
        title: 'Forked Graph',
        description: 'Forked Description',
        creator_id: 'user1',
        source_graph_id: 'source123',
        type: GraphType.PRIVATE,
        contributors: [{ name: 'Some User', profile_color: '#abcdef' }],
      },
    ]);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle errors properly', async () => {
    // Arrange
    const mockError = new Error('Database error');
    mockedSupabaseClient.single.mockRejectedValueOnce(mockError);

    // Act
    const result = await createGraph(
      'Error Graph',
      'Error Description',
      'user1',
      'Error User',
      '#ffffff',
    );

    // Assert
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', mockError);
    expect(result).toBeUndefined();
  });

  it('should handle Supabase returned errors', async () => {
    // Arrange
    const mockResponse = {
      data: null,
      error: new Error('Supabase error'),
    };
    mockedSupabaseClient.single.mockResolvedValueOnce(mockResponse);

    // Act
    const result = await createGraph(
      'Error Graph',
      'Error Description',
      'user1',
      'Error User',
      '#ffffff',
    );

    // Assert
    expect(mockedHandleErrors).toHaveBeenCalledWith('Supabase Error:', mockResponse.error);
    expect(result).toBeUndefined();
  });
});
