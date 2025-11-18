"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import {
  Users,
  MessageSquare,
  Activity as ActivityIcon,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface Overview {
  followers: number;
  following: number;
  newFollowers: number;
  newFollowing: number;
  sentMessages: number;
  receivedMessages: number;
  totalMessages: number;
  totalActivities: number;
  recentActivities: number;
  profileScore: number;
}

interface Breakdown {
  activitiesByType: Record<string, number>;
}

interface Trends {
  dailyActivity: { _id: string; count: number }[];
  dailyMessages: { _id: string; sent: number; received: number }[];
  connectionGrowth: { _id: string; count: number }[];
}

interface EngagementMetrics {
  messaging: {
    uniquePartners: number;
    responseRate: number;
    messagesPerConversation: number;
  };
  activity: {
    totalActivities: number;
    avgDailyActivities: number;
    mostActiveDay: string;
    mostActiveHour: string;
  };
}

interface Activity {
  _id: string;
  activityType: string;
  description: string;
  createdAt: Date;
  targetUser?: {
    username: string;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [timeRange, setTimeRange] = useState('30');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [timeline, setTimeline] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [personalRes, engagementRes, timelineRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/personal?timeRange=${timeRange}`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/engagement?timeRange=7`, { headers }),
        axios.get(`${API_BASE_URL}/analytics/timeline?limit=20`, { headers }),
      ]);

      if (personalRes.data.status === 'success') {
        setOverview(personalRes.data.data.overview);
        setTrends(personalRes.data.data.trends);
        setBreakdown(personalRes.data.data.breakdown);
      }

      if (engagementRes.data.status === 'success') {
        setEngagement(engagementRes.data.data);
      }

      if (timelineRes.data.status === 'success') {
        setTimeline(timelineRes.data.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading || !overview) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const activityTypeData = breakdown
    ? Object.entries(breakdown.activitiesByType).map(([type, count]) => ({
        name: formatActivityType(type),
        value: count,
      }))
    : [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your platform engagement and activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7')}
            size="sm"
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30')}
            size="sm"
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90')}
            size="sm"
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.followers}</div>
            <p className="text-xs text-gray-500">
              +{overview.newFollowers} in last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.following}</div>
            <p className="text-xs text-gray-500">
              +{overview.newFollowing} in last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalMessages}</div>
            <p className="text-xs text-gray-500">
              {overview.sentMessages} sent, {overview.receivedMessages} received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <ActivityIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalActivities}</div>
            <p className="text-xs text-gray-500">
              {overview.recentActivities} in last {timeRange} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completeness & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Profile Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${overview.profileScore * 2.51} 251`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-4xl font-bold ${getProfileScoreColor(overview.profileScore)}`}>
                    {overview.profileScore}%
                  </span>
                  <span className="text-sm text-gray-500">Complete</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              {overview.profileScore >= 80
                ? 'Excellent! Your profile is well optimized.'
                : overview.profileScore >= 60
                ? 'Good progress! Add more details to improve visibility.'
                : 'Complete your profile to get more connections.'}
            </p>
          </CardContent>
        </Card>

        {engagement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Engagement Metrics (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unique Conversations</span>
                <Badge variant="outline">{engagement.messaging.uniquePartners}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Rate</span>
                <Badge variant="outline">{engagement.messaging.responseRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Msgs per Conversation</span>
                <Badge variant="outline">{engagement.messaging.messagesPerConversation}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Daily Activities</span>
                <Badge variant="outline">{engagement.activity.avgDailyActivities}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Active Day</span>
                <Badge variant="outline">{engagement.activity.mostActiveDay}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Most Active Hour</span>
                <Badge variant="outline">{engagement.activity.mostActiveHour}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity Trend */}
          {trends.dailyActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activity Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_id"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Activities"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Message Trend */}
          {trends.dailyMessages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trends.dailyMessages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_id"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                    <Bar dataKey="received" fill="#10b981" name="Received" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Connection Growth */}
          {trends.connectionGrowth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Connection Growth (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends.connectionGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_id"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="New Followers"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Activity Breakdown */}
          {activityTypeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    {activity.targetUser && (
                      <p className="text-xs text-gray-500">
                        with {activity.targetUser.username}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{formatActivityType(activity.activityType)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
