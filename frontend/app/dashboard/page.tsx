"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import AuthController from "@/api/AuthController";
import { Button } from "rizzui";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { handleGetMyProfile, handleLogout } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true); // Default to true to avoid flash
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    // Fetch profile
    handleGetMyProfile()
      .then((response) => {
        if (response.status === 200) {
          setProfile(response.data.data.profile);
          setUser(response.data.data.user);

          // Check email verification status
          checkVerificationStatus();
        } else {
          router.push("/signin");
        }
      })
      .catch(() => {
        router.push("/signin");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const token = AuthController.getSession();
      const response = await axios.get(
        `${API_BASE_URL}/auth/verification-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        setEmailVerified(response.data.data.emailVerified);
      }
    } catch (error) {
      console.error("Failed to check verification status:", error);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const token = AuthController.getSession();

      const response = await axios.post(
        `${API_BASE_URL}/auth/resend-verification`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === "success") {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to send verification email");
      }
    } finally {
      setIsResending(false);
    }
  };

  const onLogout = async () => {
    await handleLogout();
    router.push("/signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Please complete your registration</div>
          <Link href="/registeration/innovator">
            <Button>Complete Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.firstName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.firstName?.[0] || "U"}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome, {profile.firstName} {profile.lastName}!
                </h1>
                <p className="text-gray-600 capitalize">
                  Role: {user?.registerAs || "User"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/settings">
                <Button variant="outline">Settings</Button>
              </Link>
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {!emailVerified && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-yellow-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Email Not Verified
                  </p>
                  <p className="text-sm text-yellow-700">
                    Please verify your email to unlock all features. Check your inbox for the verification link.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                size="sm"
                variant="outline"
                className="ml-4 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
              >
                {isResending ? "Sending..." : "Resend Email"}
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Profile Status</h3>
            <p className="text-3xl font-bold text-green-600">Complete</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Experience</h3>
            <p className="text-2xl font-bold">
              {profile.experienceLevel || "N/A"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-2xl font-bold">
              {profile.city && profile.country
                ? `${profile.city}, ${profile.country}`
                : "Not set"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">About</h2>
            <Link href="/profile/edit">
              <Button size="sm" variant="outline">
                Edit Profile
              </Button>
            </Link>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
        </div>

        {/* Expertise & Skills */}
        {(profile.expertise?.length > 0 || profile.skills?.length > 0) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            {profile.expertise && profile.expertise.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investor-specific */}
        {profile.organizationName && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-2">Organization</h3>
            <p className="text-lg">{profile.organizationName}</p>
            {profile.investingExperience &&
              profile.investingExperience.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Investing Experience</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.investingExperience.map(
                      (exp: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {exp}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Additional Info */}
        {(profile.phoneNo || profile.gender || profile.dateOfBirth) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.phoneNo && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{profile.phoneNo}</p>
                </div>
              )}
              {profile.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-semibold capitalize">{profile.gender}</p>
                </div>
              )}
              {profile.dateOfBirth && (
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-semibold">
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
