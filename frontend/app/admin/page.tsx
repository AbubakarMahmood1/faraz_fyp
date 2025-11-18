"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthController from "@/api/AuthController";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import { Button } from "rizzui";
import toast from "react-hot-toast";
import Link from "next/link";

interface PlatformStats {
  overview: {
    totalUsers: number;
    totalProfiles: number;
    totalConnections: number;
    totalMessages: number;
    totalActivities: number;
    activeUsers: number;
    verifiedUsers: number;
    oauthUsers: number;
    newUsers: number;
  };
  usersByRole: Record<string, number>;
  usersByProvider: Record<string, number>;
  signupTrend: Array<{ _id: string; count: number }>;
}

interface SystemHealth {
  system: {
    uptime: { seconds: number; formatted: string };
    memory: {
      total: number;
      free: number;
      used: number;
      processUsed: number;
      processTotal: number;
    };
    cpu: { user: number; system: number; cores: number };
    platform: string;
    nodeVersion: string;
    environment: string;
  };
  database: { status: string; responseTime: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = AuthController.getSession();

      const [statsResponse, healthResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/stats?timeRange=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/admin/system-health`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.data.status === "success") {
        setStats(statsResponse.data.data);
      }

      if (healthResponse.data.status === "success") {
        setSystemHealth(healthResponse.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to load admin data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!stats || !systemHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load admin data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and statistics</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users">
              <Button>Manage Users</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={stats.overview.totalUsers}
            subtitle={`${stats.overview.newUsers} new in ${timeRange} days`}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats.overview.activeUsers}
            subtitle={`${Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)}% of total`}
            color="green"
          />
          <StatCard
            title="Verified Emails"
            value={stats.overview.verifiedUsers}
            subtitle={`${Math.round((stats.overview.verifiedUsers / stats.overview.totalUsers) * 100)}% verified`}
            color="purple"
          />
          <StatCard
            title="OAuth Users"
            value={stats.overview.oauthUsers}
            subtitle={`${Math.round((stats.overview.oauthUsers / stats.overview.totalUsers) * 100)}% using OAuth`}
            color="orange"
          />
        </div>

        {/* Platform Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Profiles"
            value={stats.overview.totalProfiles}
            subtitle="Completed profiles"
            color="indigo"
          />
          <StatCard
            title="Connections"
            value={stats.overview.totalConnections}
            subtitle="Total connections made"
            color="pink"
          />
          <StatCard
            title="Messages"
            value={stats.overview.totalMessages}
            subtitle="Messages sent"
            color="cyan"
          />
        </div>

        {/* Users by Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
            <div className="space-y-3">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{role}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{count}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.overview.totalUsers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users by Provider</h2>
            <div className="space-y-3">
              {Object.entries(stats.usersByProvider).map(([provider, count]) => (
                <div key={provider} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{provider}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{count}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.overview.totalUsers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signup Trend */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Signup Trend (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-64">
            {stats.signupTrend.map((day) => (
              <div key={day._id} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(day.count / Math.max(...stats.signupTrend.map(d => d.count))) * 100}%`,
                    minHeight: day.count > 0 ? "20px" : "0px",
                  }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{day.count}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(day._id).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Server Uptime</h3>
              <p className="text-lg font-semibold">{systemHealth.system.uptime.formatted}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Memory Usage</h3>
              <p className="text-lg font-semibold">
                {formatBytes(systemHealth.system.memory.used)} / {formatBytes(systemHealth.system.memory.total)}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(systemHealth.system.memory.used / systemHealth.system.memory.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Database</h3>
              <p className="text-lg font-semibold capitalize">{systemHealth.database.status}</p>
              <p className="text-sm text-gray-600">{systemHealth.database.responseTime}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Platform</h3>
              <p className="text-lg font-semibold capitalize">{systemHealth.system.platform}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Node Version</h3>
              <p className="text-lg font-semibold">{systemHealth.system.nodeVersion}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Environment</h3>
              <p className="text-lg font-semibold capitalize">{systemHealth.system.environment}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  color: string;
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    indigo: "bg-indigo-100 text-indigo-700",
    pink: "bg-pink-100 text-pink-700",
    cyan: "bg-cyan-100 text-cyan-700",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value.toLocaleString()}</p>
      <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}
