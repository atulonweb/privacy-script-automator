
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Website } from '@/components/admin/UserWebsitesTable';
import { Script } from '@/components/admin/UserScriptsTable';
import { useFetchUserProfile } from './fetch/useFetchUserProfile';
import { useFetchUserWebsites } from './fetch/useFetchUserWebsites';
import { useFetchUserScripts } from './fetch/useFetchUserScripts';

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
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | undefined>(undefined);

  const { fetchUserProfile } = useFetchUserProfile();
  const { websites, setWebsites, fetchUserWebsites } = useFetchUserWebsites();
  const { scripts, setScripts, fetchUserScripts } = useFetchUserScripts();

  const fetchUserDetails = useCallback(async (manualRefresh = false) => {
    // Prevent multiple simultaneous fetches
    if (!userId || fetchingRef.current) return;
    
    // Avoid unnecessary refetches unless manually triggered
    if (lastFetchedUserIdRef.current === userId && !manualRefresh) return;
    
    fetchingRef.current = true;
    lastFetchedUserIdRef.current = userId;
    
    if (manualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setFetchError(null);
    
    try {
      // Fetch user profile
      const profileData = await fetchUserProfile(userId);
      if (isMountedRef.current) {
        setUserDetails(profileData);
      }
      
      // Fetch user's websites and scripts in parallel
      await Promise.all([
        fetchUserWebsites(userId),
        fetchUserScripts(userId)
      ]);
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      if (isMountedRef.current) {
        setFetchError(error.message);
        toast.error(`Failed to load user details: ${error.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
      fetchingRef.current = false;
    }
  }, [userId, fetchUserProfile, fetchUserWebsites, fetchUserScripts]);

  const manualRefresh = useCallback(() => {
    if (userId && !isRefreshing && !fetchingRef.current) {
      fetchUserDetails(true);
    }
  }, [userId, isRefreshing, fetchUserDetails]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (userId && lastFetchedUserIdRef.current !== userId) {
      fetchUserDetails();
    }
    
    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, [userId, fetchUserDetails]);

  return {
    userDetails,
    websites,
    scripts,
    loading,
    fetchError,
    isRefreshing,
    refreshUserDetails: manualRefresh
  };
}
