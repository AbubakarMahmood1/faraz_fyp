import { useCallback } from "react";
import AuthController from "@/api/AuthController";
export const useAuth = () => {
  const handleLogin = useCallback(
    async (payload: { email: ""; password: "" }) => {
      console.log(payload);
      try {
        const response = await AuthController.userLogin(payload);
        // console.log(response, "@handle");
        return response;
      } catch (err) {
        console.log(err, "@handle");
        return err;
      }
    },
    []
  );
  const setSession = (token: string) => AuthController.setSession(token);
  const handleSignup = useCallback(
    async (payload: { email: ""; password: ""; username: "" }) => {
      console.log(payload);
      try {
        const response = await AuthController.userSignup(payload);
        return response;
      } catch (err) {
        console.log(err, "@handle");
        return err;
      }
    },
    []
  );
  return {
    handleLogin,
    handleSignup,
    setSession,
  };
};
