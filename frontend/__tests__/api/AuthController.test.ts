import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AuthController from '@/api/AuthController';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('userSignup', () => {
    it('should successfully sign up a user', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          token: 'mock-jwt-token',
          data: {
            user: {
              id: '123',
              username: 'testuser',
              email: 'test@example.com',
              registerAs: 'innovator',
            },
          },
        },
        status: 201,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const payload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      const result = await AuthController.userSignup(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/signup'),
        payload
      );
      expect(result.status).toBe(201);
      expect(result.data.status).toBe('success');
      expect(result.data.token).toBe('mock-jwt-token');
    });

    it('should handle signup error for duplicate email', async () => {
      const mockError = {
        response: {
          data: {
            status: 'fail',
            message: 'Email already exists',
          },
          status: 409,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const payload = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      try {
        await AuthController.userSignup(payload);
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('Email already exists');
      }
    });
  });

  describe('userLogin', () => {
    it('should successfully log in a user', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          token: 'mock-jwt-token',
          data: {
            user: {
              id: '123',
              username: 'testuser',
              email: 'test@example.com',
            },
          },
        },
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const payload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthController.userLogin(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/login'),
        payload
      );
      expect(result.status).toBe(200);
      expect(result.data.token).toBe('mock-jwt-token');
    });

    it('should handle login error for invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            status: 'fail',
            message: 'Invalid email or password',
          },
          status: 401,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const payload = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      try {
        await AuthController.userLogin(payload);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('Invalid');
      }
    });
  });

  describe('Session Management', () => {
    it('should set session token in localStorage', () => {
      const token = 'test-jwt-token';
      AuthController.setSession(token);

      expect(localStorage.getItem('token')).toBe(token);
    });

    it('should get session token from localStorage', () => {
      const token = 'test-jwt-token';
      localStorage.setItem('token', token);

      const retrievedToken = AuthController.getSession();

      expect(retrievedToken).toBe(token);
    });

    it('should clear session token from localStorage', () => {
      localStorage.setItem('token', 'test-jwt-token');

      AuthController.clearSession();

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should return null when no session exists', () => {
      const token = AuthController.getSession();

      expect(token).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Password reset link sent to your email',
        },
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const payload = { email: 'test@example.com' };

      const result = await AuthController.forgotPassword(payload);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/password/forgot'),
        payload
      );
      expect(result.status).toBe(200);
      expect(result.data.message).toContain('Password reset');
    });

    it('should handle forgot password error', async () => {
      const mockError = {
        response: {
          data: {
            status: 'error',
            message: 'Failed to send reset email',
          },
          status: 500,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const payload = { email: 'test@example.com' };

      try {
        await AuthController.forgotPassword(payload);
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });
});
