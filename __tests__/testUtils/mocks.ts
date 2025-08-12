/**
 * Central mocks used across API tests to avoid hitting real DB or Next server edge specifics.
 */
export function mockDbModules() {
  jest.mock('@/utils', () => ({
    __esModule: true,
    // Export a minimal db client mock or named exports used by code under test
    default: {
      query: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  }));

  jest.mock('@/utils/schema', () => {
    // Re-export types via any to satisfy TS in tests while providing shape stubs
    const actual = jest.requireActual('@/utils/schema');
    return {
      __esModule: true,
      ...actual,
    };
  });
}

/**
 * Example of mocking next/server constructs used in route handlers.
 */
export function mockNextServer() {
  jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
      ...actual,
      NextResponse: {
        json: (body: any, init?: any) => ({ body, init }),
      },
    };
  });
}
