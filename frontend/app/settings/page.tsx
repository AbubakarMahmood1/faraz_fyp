"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Password, Input } from "rizzui";
import toast from "react-hot-toast";
import Link from "next/link";
import Form from "@/components/shared/form/form";
import { useProfile } from "@/hooks/use-profile";

export default function SettingsPage() {
  const router = useRouter();
  const { handleUpdatePassword, handleLogout } = useProfile();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await handleUpdatePassword(currentPassword, newPassword);

      if (response.status === 200) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorMessage =
          response.data?.message || "Failed to update password";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = async () => {
    await handleLogout();
    toast.success("Logged out successfully");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
          <Link href="/profile/edit">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <Form onSubmit={handlePasswordChange} className="max-w-md">
            <Password
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Password
              label="New Password"
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Password
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Update Password
            </Button>
          </Form>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Account Actions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Logout</h3>
              <p className="text-sm text-gray-600 mb-3">
                Sign out of your account
              </p>
              <Button onClick={onLogout} variant="outline">
                Logout
              </Button>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-3">
                Delete your account and all associated data
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                disabled
              >
                Delete Account (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
