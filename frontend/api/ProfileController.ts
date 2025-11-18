import { apiClient } from "./api.config";

export interface CompleteProfileData {
  // Personal Information
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNo?: string;
  country?: string;
  city?: string;
  bio: string;
  profileImage?: string;

  // Professional (Experts & Innovators)
  expertise?: string[];
  skills?: string[];
  experienceLevel?: string;

  // Investor-specific
  organizationName?: string;
  investingExperience?: string[];
}

class ProfileController {
  /**
   * Complete user profile after registration
   * POST /api/profile/complete
   */
  static completeProfile(data: CompleteProfileData): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .post("/profile/complete", data)
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  /**
   * Get current user's profile
   * GET /api/profile/me
   */
  static getMyProfile(): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .get("/profile/me")
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  /**
   * Update user profile
   * PUT /api/profile
   */
  static updateProfile(data: Partial<CompleteProfileData>): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .put("/profile", data)
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  /**
   * Logout user
   * POST /api/logout
   */
  static logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .post("/logout")
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  /**
   * Update password
   * PATCH /api/users/update-password
   */
  static updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .patch("/users/update-password", data)
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  /**
   * Forgot password
   * POST /api/password/forgot
   */
  static forgotPassword(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      apiClient
        .post("/password/forgot", { email })
        .then((res) => {
          if (res.status === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }
}

export default ProfileController;
