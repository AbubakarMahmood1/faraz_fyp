import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfile } from '@/hooks/use-profile';
import ProfileController from '@/api/ProfileController';

// Mock ProfileController
vi.mock('@/api/ProfileController');

describe('useProfile hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleCompleteProfile', () => {
    it('should call ProfileController.completeProfile with correct data', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: { profile: { firstName: 'John' } },
        },
        status: 200,
      };

      vi.mocked(ProfileController.completeProfile).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'This is a test bio that is more than fifty characters long to pass validation.',
      };

      const response = await result.current.handleCompleteProfile(profileData);

      expect(ProfileController.completeProfile).toHaveBeenCalledWith(profileData);
      expect(response).toEqual(mockResponse);
    });

    it('should handle profile completion errors', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(ProfileController.completeProfile).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useProfile());

      const profileData = {
        firstName: 'John',
        bio: 'Too short',
      };

      const response = await result.current.handleCompleteProfile(profileData);

      expect(response).toEqual(mockError);
    });
  });

  describe('handleGetMyProfile', () => {
    it('should fetch user profile', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            profile: { firstName: 'John', lastName: 'Doe' },
            user: { email: 'john@example.com' },
          },
        },
        status: 200,
      };

      vi.mocked(ProfileController.getMyProfile).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const response = await result.current.handleGetMyProfile();

      expect(ProfileController.getMyProfile).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('handleUpdateProfile', () => {
    it('should update profile with new data', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: { profile: { firstName: 'Jane' } },
        },
        status: 200,
      };

      vi.mocked(ProfileController.updateProfile).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const updates = { firstName: 'Jane' };

      const response = await result.current.handleUpdateProfile(updates);

      expect(ProfileController.updateProfile).toHaveBeenCalledWith(updates);
      expect(response).toEqual(mockResponse);
    });
  });

  describe('handleLogout', () => {
    it('should call logout endpoint', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Logged out successfully',
        },
        status: 200,
      };

      vi.mocked(ProfileController.logout).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const response = await result.current.handleLogout();

      expect(ProfileController.logout).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });
  });

  describe('handleUpdatePassword', () => {
    it('should update password with current and new password', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Password updated successfully',
        },
        status: 200,
      };

      vi.mocked(ProfileController.updatePassword).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const response = await result.current.handleUpdatePassword(
        'oldPassword',
        'newPassword'
      );

      expect(ProfileController.updatePassword).toHaveBeenCalledWith(
        'oldPassword',
        'newPassword'
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle password update errors', async () => {
      const mockError = new Error('Current password is incorrect');

      vi.mocked(ProfileController.updatePassword).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useProfile());

      const response = await result.current.handleUpdatePassword(
        'wrongPassword',
        'newPassword'
      );

      expect(response).toEqual(mockError);
    });
  });

  describe('handleForgotPassword', () => {
    it('should send password reset email', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Reset link sent',
        },
        status: 200,
      };

      vi.mocked(ProfileController.forgotPassword).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProfile());

      const response = await result.current.handleForgotPassword('test@example.com');

      expect(ProfileController.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(response).toEqual(mockResponse);
    });
  });
});
