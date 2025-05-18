
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
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const initialFetchDone = useRef(false);
  const lastFetchedUserId = useRef<string | undefined>(undefined);

  const { setUserProfile, fetchUserProfile } = useFetchUserProfile();
  const { websites, setWebsites, fetchUserWebsites } = useFetchUserWebsites();
  const { scripts, setScripts, fetchUserScripts } = useFetchUserScripts();

  const fetchUserDetails = useCallback(async (manualRefresh = false) => {
    // Don't fetch if we're already fetching or if the userId is the same as the last fetched
    if (!userId || fetchingRef.current) return;
    if (lastFetchedUserId.current === userId && initialFetchDone.current && !manualRefresh) return;
    
    fetchingRef.current = true;
    lastFetchedUserId.current = userId;
    
    if (manualRefresh) {
      setIsRefreshing(true);
    } else if (!initialFetchDone.current) {
      setLoading(true);
    }
    
    setFetchError(null);
    
    try {
      // Fetch user profile
      const profileData = await fetchUserProfile(userId);
      if (isMounted.current) {
        setUserDetails(profileData);
      }
      
      // Fetch user's websites
      await fetchUserWebsites(userId);
      
      // Fetch user's scripts
      await fetchUserScripts(userId);
      
      initialFetchDone.current = true;
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
  }, [userId, fetchUserProfile, fetchUserWebsites, fetchUserScripts]);

  useEffect(() => {
    isMounted.current = true;
    
    // Only fetch if the userId changes or this is the first render
    if (userId && (lastFetchedUserId.current !== userId || !initialFetchDone.current)) {
      fetchUserDetails();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [userId, fetchUserDetails]); // Include fetchUserDetails here to ensure it runs when userId changes

  const manualRefresh = useCallback(() => {
    if (userId && !isRefreshing && !fetchingRef.current) {
      fetchUserDetails(true);
    }
  }, [userId, isRefreshing, fetchUserDetails]);

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
