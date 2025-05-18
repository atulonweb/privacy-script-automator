
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Website } from '@/components/admin/UserWebsitesTable';
import { Script } from '@/components/admin/UserScriptsTable';
import { Webhook } from '@/types/webhook.types';
import { useFetchUserProfile } from './fetch/useFetchUserProfile';
import { useFetchUserWebsites } from './fetch/useFetchUserWebsites';
import { useFetchUserScripts } from './fetch/useFetchUserScripts';
import { useFetchUserWebhooks } from './fetch/useFetchUserWebhooks';

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export function useUserDetails(userId: string | undefined) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const initialFetchDone = useRef(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  const { setUserProfile, fetchUserProfile } = useFetchUserProfile();
  const { websites, setWebsites, fetchUserWebsites } = useFetchUserWebsites();
  const { scripts, setScripts, fetchUserScripts } = useFetchUserScripts();
  const { webhooks, setWebhooks, fetchUserWebhooks } = useFetchUserWebhooks();

  const fetchUserDetails = useCallback(async () => {
    if (!userId || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setFetchError(null);
    
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
    } else {
      setIsRefreshing(true);
    }
    
    try {
      console.log("Fetching details for user ID:", userId);
      
      // Fetch user profile
      const profileData = await fetchUserProfile(userId);
      if (isMounted.current) {
        setUserDetails(profileData);
      }
      
      // Fetch user's websites
      await fetchUserWebsites(userId);
      
      // Fetch user's scripts
      await fetchUserScripts(userId);
      
      // Fetch user's webhooks
      await fetchUserWebhooks(userId);
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      if (isMounted.current) {
        setFetchError(error.message);
        toast.error(`Failed to load user details: ${error.message}`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, [userId, fetchUserProfile, fetchUserWebsites, fetchUserScripts, fetchUserWebhooks]);

  // Clear any existing timeout on component unmount
  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current !== null) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    initialFetchDone.current = false;
    
    if (userId) {
      fetchUserDetails();
    }
    
    return () => {
      isMounted.current = false;
      clearRefreshTimeout();
    };
  }, [userId, fetchUserDetails, clearRefreshTimeout]);

  const manualRefresh = useCallback(() => {
    if (userId && !isRefreshing && !fetchingRef.current) {
      clearRefreshTimeout();
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails, isRefreshing, clearRefreshTimeout]);

  return {
    userDetails,
    websites,
    scripts,
    webhooks,
    loading,
    fetchError,
    isRefreshing,
    refreshUserDetails: manualRefresh
  };
}
