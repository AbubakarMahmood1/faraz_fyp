"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "rizzui";
import toast from "react-hot-toast";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/password/forgot`, {
        email,
      });

      if (response.status === 200) {
        toast.success("Password reset link sent!");
        setEmailSent(true);
      } else {
        toast.error(response.data?.message || "Failed to send reset email");
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);

      if (error.response) {
        const message =
          error.response.data?.message || "Failed to send reset email";
        toast.error(message);
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>

            <p className="text-gray-600 mb-2">
              If an account exists with <strong>{email}</strong>, we've sent a
              password reset link.
            </p>

            <p className="text-sm text-gray-500 mb-6">
              The link will expire in 10 minutes. If you don't see the email,
              check your spam folder.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Link
              </Button>

              <Link href="/signin">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Didn't request this?{" "}
              <Link href="/signin" className="text-blue-600 hover:text-blue-700">
                Sign in instead
              </Link>
            </p>
          </div>
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
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
