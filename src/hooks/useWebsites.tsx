
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Website = {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  visitor_count?: number;
  accept_rate?: number;
};

export function useWebsites() {
  const { user, isAdmin } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // Reduced from 5
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchWebsites = useCallback(async (attempt = 0) => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    
    // Don't fetch if no user
    if (!user) {
      setWebsites([]);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    
    try {
      setError(null);
      
      // Only show loading on first attempt
      if (attempt === 0) {
        setLoading(true);
      }

      // Exponential backoff delay for retries
      if (attempt > 0) {
        const backoffTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
      
      let query = supabase.from('websites').select('*');
      
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (isMountedRef.current) {
        setWebsites(data || []);
        setRetryCount(0);
      }
    } catch (err: any) {
      console.error('Error fetching websites:', err);
      
      if (isMountedRef.current) {
        setError(err.message);
        
        // Only retry if not at max retries and error suggests retry might work
        if (attempt < maxRetries && !err.message.includes('not authenticated')) {
          setRetryCount(attempt + 1);
          setTimeout(() => {
            if (isMountedRef.current && fetchingRef.current) {
              fetchingRef.current = false;
              fetchWebsites(attempt + 1);
            }
          }, 1000 * Math.pow(2, attempt));
          return;
        } else if (attempt === 0) {
          // Only show toast on first attempt failure
          toast.error('Failed to load websites');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [user, isAdmin, maxRetries]);

  // Stable functions that don't cause re-renders
  const addWebsite = useCallback(async (name: string, domain: string) => {
    try {
      if (!user) {
        toast.error('You must be logged in to add a website');
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.from('websites').insert({
        name,
        domain,
        user_id: user.id
      }).select();
      
      if (error) throw error;
      
      toast.success('Website added successfully');
      await fetchWebsites();
      return data[0];
    } catch (err: any) {
      console.error('Error adding website:', err);
      toast.error(err.message || 'Failed to add website');
      throw err;
    }
  }, [user, fetchWebsites]);

  const updateWebsite = useCallback(async (id: string, updates: {name?: string, domain?: string}) => {
    try {
      if (!user) {
        toast.error('You must be logged in to update a website');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('websites')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Website updated successfully');
      await fetchWebsites();
      return true;
    } catch (err: any) {
      console.error('Error updating website:', err);
      toast.error(err.message || 'Failed to update website');
      throw err;
    }
  }, [user, fetchWebsites]);

  const updateWebsiteStatus = useCallback(async (id: string, active: boolean) => {
    try {
      if (!user) {
        toast.error('You must be logged in to update website status');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('websites')
        .update({ active })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Website status updated');
      await fetchWebsites();
    } catch (err: any) {
      console.error('Error updating website status:', err);
      toast.error(err.message || 'Failed to update website status');
      throw err;
    }
  }, [user, fetchWebsites]);

  const deleteWebsite = useCallback(async (id: string) => {
    try {
      if (!user) {
        toast.error('You must be logged in to delete a website');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Website deleted');
      await fetchWebsites();
    } catch (err: any) {
      console.error('Error deleting website:', err);
      toast.error(err.message || 'Failed to delete website');
      throw err;
    }
  }, [user, fetchWebsites]);

  // Cleanup and fetch logic
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch if we have a user and haven't started fetching
    if (user && !fetchingRef.current) {
      fetchWebsites();
    } else if (!user) {
      setWebsites([]);
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, [user, fetchWebsites]);

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    addWebsite,
    updateWebsite,
    updateWebsiteStatus,
    deleteWebsite,
    retryCount
  };
}
