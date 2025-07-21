import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type DomainActivity = {
  id: string;
  script_id: string;
  event_type: string;
  domain: string;
  url: string | null;
  visitor_id: string | null;
  session_id: string | null;
  user_agent: string | null;
  region: string | null;
  language: string | null;
  created_at: string;
};

export type GeographicData = {
  region: string;
  count: number;
  percentage: number;
};

export type DeviceData = {
  browser: string;
  count: number;
  percentage: number;
};

export type LanguageData = {
  language: string;
  count: number;
  percentage: number;
};

export type SessionData = {
  avgSessionDuration: number;
  activeVisitors: number;
  bounceRate: number;
  totalSessions: number;
};

export function useDetailedAnalytics(websiteId?: string, timeRange: number = 7) {
  const { user } = useAuth();
  const [domainActivity, setDomainActivity] = useState<DomainActivity[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [sessionData, setSessionData] = useState<SessionData>({
    avgSessionDuration: 0,
    activeVisitors: 0,
    bounceRate: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchDetailedAnalytics = async () => {
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
          setDomainActivity([]);
          setGeographicData([]);
          setDeviceData([]);
          setLanguageData([]);
          setSessionData({
            avgSessionDuration: 0,
            activeVisitors: 0,
            bounceRate: 0,
            totalSessions: 0,
          });
        }
        return;
      }
      
      const scriptIds = scripts.map(script => script.id);
      
      // Calculate date range
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - timeRange);
      
      // Get domain activity data for the time range
      const { data: activity, error: activityError } = await supabase
        .from('domain_activity')
        .select('*')
        .in('script_id', scriptIds)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false });
      
      if (activityError) throw activityError;
      
      const activityData = activity || [];
      
      if (isMountedRef.current) {
        setDomainActivity(activityData);
        
        // Process geographic data
        const regionCounts = activityData.reduce((acc: Record<string, number>, item) => {
          const region = item.region || 'Unknown';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {});
        
        const totalRegionCount = Object.values(regionCounts).reduce((sum, count) => sum + count, 0);
        const geoData = Object.entries(regionCounts).map(([region, count]) => ({
          region: region.charAt(0).toUpperCase() + region.slice(1),
          count,
          percentage: Math.round((count / totalRegionCount) * 100),
        })).sort((a, b) => b.count - a.count);
        
        setGeographicData(geoData);
        
        // Process device/browser data
        const browserCounts = activityData.reduce((acc: Record<string, number>, item) => {
          if (item.user_agent) {
            let browser = 'Unknown';
            const userAgent = item.user_agent.toLowerCase();
            if (userAgent.includes('chrome')) browser = 'Chrome';
            else if (userAgent.includes('firefox')) browser = 'Firefox';
            else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'Safari';
            else if (userAgent.includes('edge')) browser = 'Edge';
            else if (userAgent.includes('opera')) browser = 'Opera';
            
            acc[browser] = (acc[browser] || 0) + 1;
          }
          return acc;
        }, {});
        
        const totalBrowserCount = Object.values(browserCounts).reduce((sum, count) => sum + count, 0);
        const deviceData = Object.entries(browserCounts).map(([browser, count]) => ({
          browser,
          count,
          percentage: Math.round((count / totalBrowserCount) * 100),
        })).sort((a, b) => b.count - a.count);
        
        setDeviceData(deviceData);
        
        // Process language data
        const languageCounts = activityData.reduce((acc: Record<string, number>, item) => {
          const language = item.language || 'Unknown';
          acc[language] = (acc[language] || 0) + 1;
          return acc;
        }, {});
        
        const totalLanguageCount = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
        const langData = Object.entries(languageCounts).map(([language, count]) => ({
          language: language.split('-')[0].toUpperCase(), // Convert en-US to EN
          count,
          percentage: Math.round((count / totalLanguageCount) * 100),
        })).sort((a, b) => b.count - a.count);
        
        setLanguageData(langData);
        
        // Calculate session analytics
        const sessions = activityData.reduce((acc: Record<string, any>, item) => {
          if (item.session_id) {
            if (!acc[item.session_id]) {
              acc[item.session_id] = {
                startTime: new Date(item.created_at),
                endTime: new Date(item.created_at),
                events: 1,
                visitor_id: item.visitor_id,
              };
            } else {
              acc[item.session_id].endTime = new Date(item.created_at);
              acc[item.session_id].events += 1;
            }
          }
          return acc;
        }, {});
        
        const sessionArray = Object.values(sessions);
        const totalSessions = sessionArray.length;
        
        // Calculate average session duration (in minutes)
        const avgDuration = sessionArray.reduce((sum: number, session: any) => {
          const duration = (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60;
          return sum + duration;
        }, 0) / (totalSessions || 1);
        
        // Calculate bounce rate (sessions with only 1 event)
        const bounceSessions = sessionArray.filter((session: any) => session.events === 1).length;
        const bounceRate = Math.round((bounceSessions / (totalSessions || 1)) * 100);
        
        // Calculate active visitors (visitors in last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const activeVisitors = new Set(
          activityData
            .filter(item => new Date(item.created_at) > thirtyMinutesAgo)
            .map(item => item.visitor_id)
            .filter(Boolean)
        ).size;
        
        setSessionData({
          avgSessionDuration: Math.round(avgDuration),
          activeVisitors,
          bounceRate,
          totalSessions,
        });
      }
      
    } catch (err: any) {
      console.error('Error fetching detailed analytics:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch detailed analytics data');
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
      fetchDetailedAnalytics();
    }

    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, [user, websiteId, timeRange]);

  return {
    domainActivity,
    geographicData,
    deviceData,
    languageData,
    sessionData,
    loading,
    error,
    fetchDetailedAnalytics
  };
}