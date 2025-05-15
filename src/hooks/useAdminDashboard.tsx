
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DashboardStatistics {
  totalUsers: number;
  totalWebsites: number;
  activeScripts: number;
  revenue: number;
}

export interface GraphDataItem {
  month: string;
  users: number;
  websites: number;
  revenue: number;
}

export interface PlanDistributionItem {
  name: string;
  value: number;
}

export interface User {
  id: string;
  full_name: string | null;
  email: string;
  websites: number;
  plan: string;
  created_at: string;
}

export const useAdminDashboard = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalUsers: 0,
    totalWebsites: 0,
    activeScripts: 0,
    revenue: 0
  });
  
  const [graphData, setGraphData] = useState<GraphDataItem[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistributionItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAdminData();
  }, []);

  return {
    statistics,
    graphData,
    planDistribution,
    recentUsers,
    loading,
    fetchAdminData
  };
};
