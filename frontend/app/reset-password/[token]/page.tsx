"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Password } from "rizzui";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import AuthController from "@/api/AuthController";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const existingToken = AuthController.getSession();
    if (existingToken) {
      toast.error("You are already logged in");
      router.push("/dashboard");
      return;
    }

    // Validate token exists
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/signin");
      return;
    }

    setIsValidating(false);
    setIsValidToken(true);
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/password/reset/${token}`,
        { password }
      );

      if (response.status === 200) {
        toast.success("Password reset successful! Logging you in...");

        // Save the new token from response
        if (response.data.token) {
          AuthController.setSession(response.data.token);
        }

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        toast.error(response.data?.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);

      if (error.response) {
        const message = error.response.data?.message || "Failed to reset password";

        if (error.response.status === 400) {
          toast.error(message + ". The link may have expired.");
          setTimeout(() => {
            router.push("/forgot-password");
          }, 2000);
        } else {
          toast.error(message);
        }
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button onClick={() => router.push("/forgot-password")}>
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Password
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                helperText="Must be at least 6 characters long"
              />
            </div>

            <div>
              <Password
                label="Confirm New Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/signin")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back to Sign In
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This link will expire in 10 minutes for security reasons.</p>
        </div>
      </div>
    </div>
  );
}
