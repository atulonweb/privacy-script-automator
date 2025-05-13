
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Analytics = {
  id: string;
  script_id: string;
  accept_count: number;
  reject_count: number;
  partial_count: number;
  visitor_count: number;
  date: string;
  created_at: string;
  updated_at: string;
};

export type AnalyticsChartData = {
  date: string;
  accept: number;
  reject: number;
  partial: number;
};

export function useAnalytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<Analytics[]>([]);
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Join analytics with consent_scripts to get user_id
      const { data, error } = await supabase
        .from('analytics')
        .select(`
          *,
          consent_scripts!inner (
            user_id,
            website_id
          )
        `);
      
      if (error) throw error;
      
      setAnalyticsData(data || []);
      
      // Process data for charts
      const processedData = processDataForCharts(data);
      setChartData(processedData);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const processDataForCharts = (data: any[]): AnalyticsChartData[] => {
    if (!data || data.length === 0) return [];
    
    // Group by date
    const groupedByDate = data.reduce((acc: any, item: any) => {
      const date = new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = {
          date,
          accept: 0,
          reject: 0,
          partial: 0
        };
      }
      
      acc[date].accept += item.accept_count;
      acc[date].reject += item.reject_count;
      acc[date].partial += item.partial_count;
      
      return acc;
    }, {});
    
    return Object.values(groupedByDate);
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
