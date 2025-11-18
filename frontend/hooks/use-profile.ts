import { useCallback } from "react";
import ProfileController, { CompleteProfileData } from "@/api/ProfileController";
import AuthController from "@/api/AuthController";

export const useProfile = () => {
  const handleCompleteProfile = useCallback(
    async (payload: CompleteProfileData) => {
      try {
        const response = await ProfileController.completeProfile(payload);
        return response;
      } catch (err) {
        console.log(err, "@handleCompleteProfile");
        return err;
      }
    },
    []
  );

  const handleGetMyProfile = useCallback(async () => {
    try {
      const response = await ProfileController.getMyProfile();
      return response;
    } catch (err) {
      console.log(err, "@handleGetMyProfile");
      return err;
    }
  }, []);

  const handleUpdateProfile = useCallback(
    async (payload: Partial<CompleteProfileData>) => {
      try {
        const response = await ProfileController.updateProfile(payload);
        return response;
      } catch (err) {
        console.log(err, "@handleUpdateProfile");
        return err;
      }
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      const response = await ProfileController.logout();
      // Clear local session on logout
      localStorage.removeItem("loginToken");
      return response;
    } catch (err) {
      console.log(err, "@handleLogout");
      return err;
    }
  }, []);

  const handleUpdatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const response = await ProfileController.updatePassword({
          currentPassword,
          newPassword,
        });
        return response;
      } catch (err) {
        console.log(err, "@handleUpdatePassword");
        return err;
      }
    },
    []
  );

  const handleForgotPassword = useCallback(async (email: string) => {
    try {
      const response = await ProfileController.forgotPassword(email);
      return response;
    } catch (err) {
      console.log(err, "@handleForgotPassword");
      return err;
    }
  }, []);

  return {
    handleCompleteProfile,
    handleGetMyProfile,
    handleUpdateProfile,
    handleLogout,
    handleUpdatePassword,
    handleForgotPassword,
  };
};
