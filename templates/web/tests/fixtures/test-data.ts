/**
 * Test fixture data for E2E tests
 * Centralized test data to maintain consistency across tests
 */

export const testUsers = {
  validUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePassword123!',
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
  },
  invalidUser: {
    name: 'A', // Too short
    email: 'invalid-email', // Invalid format
    password: '123', // Too weak
  },
};

export const testPosts = {
  validPost: {
    title: 'Test Post Title',
    content: 'This is test post content with enough length to be valid.',
    author: 'test@example.com',
  },
  longPost: {
    title: 'Long Post Title',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
    author: 'test@example.com',
  },
  invalidPost: {
    title: '', // Empty
    content: '', // Empty
    author: 'invalid',
  },
};

export const testComments = {
  validComment: {
    text: 'This is a test comment',
    author: 'test@example.com',
  },
  longComment: {
    text: 'Lorem ipsum dolor sit amet. '.repeat(20),
    author: 'test@example.com',
  },
};

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}@example.com`;
}

/**
 * Generate a unique username
 */
export function generateUniqueUsername(prefix: string = 'user'): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create test user data with unique values
 */
export function createTestUser(overrides?: Partial<typeof testUsers.validUser>) {
  return {
    ...testUsers.validUser,
    email: generateUniqueEmail(),
    ...overrides,
  };
}

/**
 * Create test post data with unique values
 */
export function createTestPost(overrides?: Partial<typeof testPosts.validPost>) {
  return {
    ...testPosts.validPost,
    title: `Test Post ${Date.now()}`,
    ...overrides,
  };
}

/**
 * Mock API responses
 */
export const mockApiResponses = {
  users: {
    list: {
      success: true,
      data: {
        users: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      },
    },
    single: {
      success: true,
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
    created: {
      success: true,
      data: {
        id: '3',
        name: 'New User',
        email: 'newuser@example.com',
      },
    },
    error: {
      success: false,
      error: {
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      },
    },
  },
  auth: {
    login: {
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        token: 'mock-jwt-token',
      },
    },
    logout: {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    },
    unauthorized: {
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
    },
  },
};

/**
 * Test environment URLs
 */
export const testUrls = {
  home: '/',
  components: '/components',
  login: '/login',
  signup: '/signup',
  profile: '/profile',
  settings: '/settings',
  api: {
    users: '/api/users',
    user: (id: string) => `/api/users/${id}`,
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
    },
  },
};

/**
 * Common test timeouts
 */
export const testTimeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  animation: 1000,
};

/**
 * Viewport sizes for responsive testing
 */
export const viewportSizes = {
  mobile: { width: 375, height: 667 },
  mobileLarge: { width: 414, height: 896 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1920, height: 1080 },
  desktopWide: { width: 2560, height: 1440 },
};
