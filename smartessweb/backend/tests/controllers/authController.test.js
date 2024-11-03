const request = require('supertest');
const express = require('express');
const supabase = require('../../config/supabase.js');
const authRoutes = require('../../routes/authRoutes.js');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

jest.mock('../../config/supabase', () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

describe('Auth Controller', () => {
  describe('POST /auth/login', () => {
    it('should return 200 and a success message with a token on successful login', async () => {
      const mockResponse = {
        data: {
          session: { access_token: 'mocked_token' },
          user: { id: 'mocked_user_id' },
        },
        error: null,
      };
      supabase.auth.signInWithPassword.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mocked_token',
        user: { id: 'mocked_user_id' },
      });
    });

    it('should return 400 if there is an authentication error', async () => {
      const mockError = { error: { message: 'Invalid login credentials' } };
      supabase.auth.signInWithPassword.mockResolvedValue(mockError);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid login credentials' });
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 200 and a success message on successful logout', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Logout successful' });
    });

    it('should return 400 if there is an error during logout', async () => {
      const mockError = { error: { message: 'Logout error' } };
      supabase.auth.signOut.mockResolvedValue(mockError);

      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Logout error' });
    });
  });
});
