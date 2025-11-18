import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';
import AuthController from '@/api/AuthController';

// Mock AuthController
vi.mock('@/api/AuthController');

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleLogin', () => {
    it('should call AuthController.userLogin with correct payload', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          token: 'mock-token',
        },
        status: 200,
      };

      vi.mocked(AuthController.userLogin).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth());

      const payload = {
        email: 'test@example.com' as '',
        password: 'password123' as '',
      };

      const response = await result.current.handleLogin(payload);

      expect(AuthController.userLogin).toHaveBeenCalledWith(payload);
      expect(response).toEqual(mockResponse);
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Login failed');

      vi.mocked(AuthController.userLogin).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAuth());

      const payload = {
        email: 'test@example.com' as '',
        password: 'wrongpassword' as '',
      };

      const response = await result.current.handleLogin(payload);

      expect(response).toEqual(mockError);
    });
  });

  describe('handleSignup', () => {
    it('should call AuthController.userSignup with correct payload', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          token: 'mock-token',
        },
        status: 201,
      };

      vi.mocked(AuthController.userSignup).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth());

      const payload = {
        email: 'test@example.com' as '',
        password: 'password123' as '',
        username: 'testuser' as '',
      };

      const response = await result.current.handleSignup(payload);

      expect(AuthController.userSignup).toHaveBeenCalledWith(payload);
      expect(response).toEqual(mockResponse);
    });

    it('should handle signup errors', async () => {
      const mockError = new Error('Email already exists');

      vi.mocked(AuthController.userSignup).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useAuth());

      const payload = {
        email: 'existing@example.com' as '',
        password: 'password123' as '',
        username: 'testuser' as '',
      };

      const response = await result.current.handleSignup(payload);

      expect(response).toEqual(mockError);
    });
  });

  describe('setSession', () => {
    it('should call AuthController.setSession with token', () => {
      vi.mocked(AuthController.setSession).mockImplementationOnce(() => {});

      const { result } = renderHook(() => useAuth());

      const token = 'test-jwt-token';
      result.current.setSession(token);

      expect(AuthController.setSession).toHaveBeenCalledWith(token);
    });
  });
});
