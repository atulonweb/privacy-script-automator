
import { useState, useEffect, useRef } from 'react';
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

export function useAnalytics(websiteId?: string) {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<Analytics[]>([]);
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchAnalytics = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    
    try {
      setLoading(true);
      
      // Get scripts for the current user, optionally filtered by website
      let scriptsQuery = supabase
        .from('consent_scripts')
        .select('id, script_id')
        .eq('user_id', user.id);
      
      if (websiteId) {
        scriptsQuery = scriptsQuery.eq('website_id', websiteId);
      }
      
      const { data: scripts, error: scriptsError } = await scriptsQuery;
      
      if (scriptsError) throw scriptsError;
      
      if (!scripts || scripts.length === 0) {
        if (isMountedRef.current) {
          setAnalyticsData([]);
          setChartData([]);
        }
        return;
      }
      
      // Get script IDs
      const scriptIds = scripts.map(script => script.id);
      
      console.log('Fetching analytics for script IDs:', scriptIds);
      
      // Get analytics data for these script IDs
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .in('script_id', scriptIds)
        .order('date', { ascending: true });
      
      if (analyticsError) throw analyticsError;
      
      console.log('Retrieved analytics data:', analytics);
      
      if (isMountedRef.current) {
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
      }
      
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch analytics data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    if (user && !fetchingRef.current) {
      fetchAnalytics();
    }

    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, [user, websiteId]);

  return {
    analyticsData,
    chartData,
    loading,
    error,
    fetchAnalytics
  };
}
