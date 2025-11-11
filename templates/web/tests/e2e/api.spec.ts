import { test, expect } from '@playwright/test';

test.describe('API Routes', () => {
  test('should respond to health check', async ({ request }) => {
    const response = await request.get('/api/hello');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
  });

  test('should return proper JSON content type', async ({ request }) => {
    const response = await request.get('/api/hello');

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should handle query parameters', async ({ request }) => {
    const response = await request.get('/api/hello?name=Test');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.message).toContain('Test');
  });

  test.describe('Users API', () => {
    test('should list users with pagination', async ({ request }) => {
      const response = await request.get('/api/users?page=1&limit=10');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('users');
      expect(data.data).toHaveProperty('pagination');
      expect(Array.isArray(data.data.users)).toBeTruthy();
    });

    test('should create a new user', async ({ request }) => {
      const newUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      };

      const response = await request.post('/api/users', {
        data: newUser,
      });

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.name).toBe(newUser.name);
      expect(data.data.email).toBe(newUser.email);
    });

    test('should validate user creation input', async ({ request }) => {
      const invalidUser = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
      };

      const response = await request.post('/api/users', {
        data: invalidUser,
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });

    test('should get user by ID', async ({ request }) => {
      // First create a user
      const newUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
      };

      const createResponse = await request.post('/api/users', {
        data: newUser,
      });

      const { data: createdUser } = await createResponse.json();

      // Then fetch it by ID
      const response = await request.get(`/api/users/${createdUser.id}`);

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdUser.id);
    });

    test('should return 404 for non-existent user', async ({ request }) => {
      const response = await request.get('/api/users/non-existent-id');

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    test('should update user', async ({ request }) => {
      // Create a user first
      const newUser = {
        name: 'Original Name',
        email: `test-${Date.now()}@example.com`,
      };

      const createResponse = await request.post('/api/users', {
        data: newUser,
      });

      const { data: createdUser } = await createResponse.json();

      // Update the user
      const updateData = {
        name: 'Updated Name',
      };

      const updateResponse = await request.put(`/api/users/${createdUser.id}`, {
        data: updateData,
      });

      expect(updateResponse.ok()).toBeTruthy();

      const data = await updateResponse.json();
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.email).toBe(newUser.email);
    });

    test('should delete user', async ({ request }) => {
      // Create a user first
      const newUser = {
        name: 'To Be Deleted',
        email: `test-${Date.now()}@example.com`,
      };

      const createResponse = await request.post('/api/users', {
        data: newUser,
      });

      const { data: createdUser } = await createResponse.json();

      // Delete the user
      const deleteResponse = await request.delete(`/api/users/${createdUser.id}`);

      expect(deleteResponse.ok()).toBeTruthy();

      const data = await deleteResponse.json();
      expect(data.success).toBe(true);

      // Verify user is deleted
      const getResponse = await request.get(`/api/users/${createdUser.id}`);
      expect(getResponse.status()).toBe(404);
    });
  });

  test.describe('CORS', () => {
    test('should handle OPTIONS preflight request', async ({ request }) => {
      const response = await request.fetch('/api/hello', {
        method: 'OPTIONS',
      });

      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers).toHaveProperty('access-control-allow-origin');
      expect(headers).toHaveProperty('access-control-allow-methods');
    });

    test('should include CORS headers in response', async ({ request }) => {
      const response = await request.get('/api/hello');

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async ({ request }) => {
      const response = await request.get('/api/non-existent-route');

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    });

    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post('/api/users', {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });
});
