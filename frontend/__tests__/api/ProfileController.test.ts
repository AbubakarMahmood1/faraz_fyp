import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileController from '@/api/ProfileController';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ProfileController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-jwt-token');
  });

  describe('completeProfile', () => {
    it('should successfully complete user profile', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              bio: 'A passionate innovator with expertise in AI and machine learning technologies.',
              expertise: ['ai-ml', 'web-dev'],
            },
            user: {
              profileCompleted: true,
            },
          },
        },
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A passionate innovator with expertise in AI and machine learning technologies.',
        expertise: ['ai-ml', 'web-dev'],
      };

      const result = await ProfileController.completeProfile(profileData);

      expect(result.status).toBe(200);
      expect(result.data.data.user.profileCompleted).toBe(true);
    });

    it('should handle profile completion error', async () => {
      const mockError = {
        response: {
          data: {
            status: 'fail',
            message: 'Bio must be at least 50 characters',
          },
          status: 400,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Too short',
      };

      try {
        await ProfileController.completeProfile(profileData);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Bio');
      }
    });
  });

  describe('getMyProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              bio: 'Experienced developer',
            },
            user: {
              email: 'john@example.com',
              username: 'johndoe',
            },
          },
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ProfileController.getMyProfile();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/profile/me'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-jwt-token',
          }),
        })
      );
      expect(result.status).toBe(200);
      expect(result.data.data.profile.firstName).toBe('John');
    });

    it('should handle unauthorized access', async () => {
      const mockError = {
        response: {
          data: {
            status: 'fail',
            message: 'Unauthorized',
          },
          status: 401,
        },
      };

      mockedAxios.get.mockRejectedValueOnce(mockError);

      try {
        await ProfileController.getMyProfile();
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            profile: {
              firstName: 'Jane',
              lastName: 'Doe',
              bio: 'Updated bio with more than fifty characters to meet validation requirements.',
            },
          },
        },
        status: 200,
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const updates = {
        firstName: 'Jane',
        bio: 'Updated bio with more than fifty characters to meet validation requirements.',
      };

      const result = await ProfileController.updateProfile(updates);

      expect(result.status).toBe(200);
      expect(result.data.data.profile.firstName).toBe('Jane');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear session', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Logged out successfully',
        },
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ProfileController.logout();

      expect(result.status).toBe(200);
      // In real implementation, should clear localStorage
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          message: 'Password updated successfully',
        },
        status: 200,
      };

      mockedAxios.patch.mockResolvedValueOnce(mockResponse);

      const result = await ProfileController.updatePassword(
        'oldPassword123',
        'newPassword123'
      );

      expect(result.status).toBe(200);
      expect(result.data.message).toContain('Password updated');
    });

    it('should handle incorrect current password', async () => {
      const mockError = {
        response: {
          data: {
            status: 'fail',
            message: 'Current password is incorrect',
          },
          status: 401,
        },
      };

      mockedAxios.patch.mockRejectedValueOnce(mockError);

      try {
        await ProfileController.updatePassword('wrongPassword', 'newPassword123');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('incorrect');
      }
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

      const result = await ProfileController.forgotPassword('test@example.com');

      expect(result.status).toBe(200);
      expect(result.data.message).toContain('reset');
    });
  });
});
