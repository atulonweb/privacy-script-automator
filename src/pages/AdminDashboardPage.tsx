
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';

const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', websites: 2, plan: 'Pro', joined: '2023-10-12' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', websites: 3, plan: 'Enterprise', joined: '2023-09-15' },
    { id: 3, name: 'Mark Johnson', email: 'mark@example.com', websites: 1, plan: 'Free', joined: '2023-11-01' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', websites: 5, plan: 'Pro', joined: '2023-08-22' },
  ],
  statistics: {
    totalUsers: 427,
    totalWebsites: 893,
    activeScripts: 812,
    revenue: 28450
  },
  graphData: [
    { month: 'Jan', users: 150, websites: 250, revenue: 8500 },
    { month: 'Feb', users: 220, websites: 300, revenue: 10200 },
    { month: 'Mar', users: 250, websites: 400, revenue: 12000 },
    { month: 'Apr', users: 280, websites: 460, revenue: 15000 },
    { month: 'May', users: 300, websites: 500, revenue: 16500 },
    { month: 'Jun', users: 350, websites: 550, revenue: 18000 },
    { month: 'Jul', users: 427, websites: 893, revenue: 28450 },
  ],
  planDistribution: [
    { name: 'Free', value: 240 },
    { name: 'Pro', value: 140 },
    { name: 'Enterprise', value: 47 },
  ]
};

const AdminDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.statistics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active registered users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.statistics.totalWebsites}
              </div>
              <p className="text-xs text-muted-foreground">
                Websites using ConsentGuard
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Scripts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.statistics.activeScripts}
              </div>
              <p className="text-xs text-muted-foreground">
                Scripts currently in use
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockData.statistics.revenue}</div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Growth Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Growth Overview</CardTitle>
              <CardDescription>Platform growth over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={mockData.graphData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#2563eb" fill="#93c5fd" name="Users" />
                  <Area type="monotone" dataKey="websites" stackId="2" stroke="#059669" fill="#6ee7b7" name="Websites" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Users by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.planDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Recently registered users and their usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">User</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Websites</th>
                    <th className="text-left py-3 px-4 font-medium">Plan</th>
                    <th className="text-left py-3 px-4 font-medium">Joined</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.websites}</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.plan === 'Enterprise' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.plan === 'Pro' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.joined}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
