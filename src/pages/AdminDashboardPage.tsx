import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate(); // Add the useNavigate hook
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalWebsites: 0,
    activeScripts: 0,
    revenue: 0
  });
  
  const [graphData, setGraphData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });
          
        if (userError) throw userError;
        
        // Fetch website count
        const { count: websiteCount, error: websiteError } = await supabase
          .from('websites')
          .select('id', { count: 'exact', head: true });
          
        if (websiteError) throw websiteError;
        
        // Fetch script count
        const { count: scriptCount, error: scriptError } = await supabase
          .from('consent_scripts')
          .select('id', { count: 'exact', head: true });
          
        if (scriptError) throw scriptError;
        
        // Fetch recent users
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (usersError) throw usersError;
        
        // Get additional data for those users
        const enhancedUsers = await Promise.all(users.map(async (user) => {
          // Get website count for this user
          const { count: userWebsites, error: websiteCountError } = await supabase
            .from('websites')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (websiteCountError) throw websiteCountError;
          
          // Get user email
          const { data: userData, error: userDataError } = await supabase.auth.admin.getUserById(user.id);
          if (userDataError) throw userDataError;
          
          return {
            ...user,
            email: userData?.user?.email || '',
            websites: userWebsites || 0,
            // For demo purposes, we're using a placeholder for the plan
            plan: Math.random() > 0.5 ? 'Pro' : (Math.random() > 0.5 ? 'Free' : 'Enterprise')
          };
        }));
        
        // Create dummy graph data
        const dummyGraphData = generateDummyGraphData();
        const dummyPlanDistribution = [
          { name: 'Free', value: Math.floor(userCount * 0.6) || 5 },
          { name: 'Pro', value: Math.floor(userCount * 0.3) || 3 },
          { name: 'Enterprise', value: Math.floor(userCount * 0.1) || 1 },
        ];
        
        setStatistics({
          totalUsers: userCount || 0,
          totalWebsites: websiteCount || 0,
          activeScripts: scriptCount || 0,
          revenue: calculateEstimatedRevenue(userCount || 0) || 0
        });
        
        setGraphData(dummyGraphData);
        setPlanDistribution(dummyPlanDistribution);
        setRecentUsers(enhancedUsers || []);
      } catch (error: any) {
        console.error("Error fetching admin data:", error);
        toast.error(`Failed to load admin data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);
  
  const generateDummyGraphData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map((month, index) => {
      const baseFactor = (index + 1) * 1.5;
      return {
        month,
        users: Math.floor(50 * baseFactor),
        websites: Math.floor(80 * baseFactor),
        revenue: Math.floor(5000 * baseFactor)
      };
    });
  };
  
  const calculateEstimatedRevenue = (userCount: number) => {
    // Simple revenue calculation for demo purposes
    return userCount * 20 + 5000;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <AdminLayout>
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
              <div className="text-2xl font-bold">{statistics.totalUsers}</div>
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
                {statistics.totalWebsites}
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
                {statistics.activeScripts}
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
              <div className="text-2xl font-bold">${statistics.revenue}</div>
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
                  data={graphData}
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
                <BarChart data={planDistribution}>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Websites</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || 'Unknown'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.websites}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentUsers.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
