
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type Analytics = {
  id: string;
  date: string;
  script_id: string;
  visitor_count: number;
  accept_count: number;
  reject_count: number;
  partial_count: number;
  created_at: string;
  updated_at: string;
};

export type AnalyticsChartData = {
  date: string;
  visitors: number;
  accepts: number;
  rejects: number;
  partials: number;
};

export function useAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<Analytics[]>([]);
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      // Get all scripts for the current user
      const { data: scripts, error: scriptsError } = await supabase
        .from('consent_scripts')
        .select('script_id')
        .eq('user_id', user.id);
      
      if (scriptsError) throw scriptsError;
      
      if (!scripts || scripts.length === 0) {
        setAnalyticsData([]);
        setChartData([]);
        setLoading(false);
        return;
      }
      
      // Get script IDs
      const scriptIds = scripts.map(script => script.script_id);
      
      // Get analytics data for these script IDs
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .in('script_id', scriptIds)
        .order('date', { ascending: true });
      
      if (analyticsError) throw analyticsError;
      
      setAnalyticsData(analytics || []);
      
      // Transform data for charts
      const transformedData = (analytics || []).map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        visitors: item.visitor_count || 0,
        accepts: item.accept_count || 0,
        rejects: item.reject_count || 0,
        partials: item.partial_count || 0,
      }));
      
      setChartData(transformedData);
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  return {
    analyticsData,
    chartData,
    loading,
    error,
    fetchAnalytics
  };
}
