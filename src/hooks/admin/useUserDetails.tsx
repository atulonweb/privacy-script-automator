
import { useState, useEffect, useCallback } from 'react';
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

  const { setUserProfile, fetchUserProfile } = useFetchUserProfile();
  const { websites, setWebsites, fetchUserWebsites } = useFetchUserWebsites();
  const { scripts, setScripts, fetchUserScripts } = useFetchUserScripts();
  const { webhooks, setWebhooks, fetchUserWebhooks } = useFetchUserWebhooks();

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setFetchError(null);
    setIsRefreshing(true);
    
    try {
      console.log("Fetching details for user ID:", userId);
      
      // Fetch user profile
      const profileData = await fetchUserProfile(userId);
      setUserDetails(profileData);
      
      // Fetch user's websites
      await fetchUserWebsites(userId);
      
      // Fetch user's scripts
      await fetchUserScripts(userId);
      
      // Fetch user's webhooks
      await fetchUserWebhooks(userId);
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setFetchError(error.message);
      toast.error(`Failed to load user details: ${error.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, fetchUserProfile, fetchUserWebsites, fetchUserScripts, fetchUserWebhooks]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  return {
    userDetails,
    websites,
    scripts,
    webhooks,
    loading,
    fetchError,
    isRefreshing,
    fetchUserDetails
  };
}
