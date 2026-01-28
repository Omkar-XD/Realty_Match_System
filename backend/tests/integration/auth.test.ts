import request from 'supertest';
import app from '../../src/app';
import { supabase } from '../../src/config/database';

describe('Auth API Integration Tests', () => {
  const testUser = {
    email: 'test@realtymatch.com',
    password: 'password123',
  };

  beforeAll(async () => {
    // Setup: Ensure test user exists
    // This would typically involve database seeding
  });

  afterAll(async () => {
    // Cleanup: Remove test data
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should enforce rate limiting after multiple attempts', async () => {
      // Make multiple login attempts
      const promises = Array(6)
        .fill(null)
        .map(() =>
          request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: 'wrongpassword',
          })
        );

      const responses = await Promise.all(promises);
      const lastResponse = responses[responses.length - 1];

      // Last request should be rate limited
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('Authentication Token', () => {
    let authToken: string;

    beforeAll(async () => {
      // Get a valid token
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);

      authToken = response.body.data.token;
    });

    it('should accept valid token for protected routes', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject requests without token', async () => {
      const response = await request(app).get('/api/users').expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject requests with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', authToken) // Missing 'Bearer'
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});