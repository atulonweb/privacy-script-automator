
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ConsentScript } from '@/types/script.types';

export function useFetchScripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ConsentScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // Reduced from 5
  const fetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const toastShownRef = useRef(false);

  const fetchScripts = useCallback(async (attempt = 0) => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) return;
    
    if (!user) {
      setScripts([]);
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
      
      const { data, error } = await supabase
        .from('consent_scripts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (isMountedRef.current) {
        console.log("Fetched scripts:", data);
        setScripts(data || []);
        setRetryCount(0);
        toastShownRef.current = false; // Reset toast flag on success
      }
    } catch (err: any) {
      console.error('Error fetching scripts:', err);
      
      if (isMountedRef.current) {
        setError(err.message);
        
        // Only show toast once and only on first attempt
        if (!toastShownRef.current && attempt === 0) {
          toast({
            title: "Error",
            description: "Failed to load scripts"
          });
          toastShownRef.current = true;
        }
        
        // Only retry if not at max retries and error suggests retry might work
        if (attempt < maxRetries && !err.message.includes('not authenticated')) {
          setRetryCount(attempt + 1);
          setTimeout(() => {
            if (isMountedRef.current && fetchingRef.current) {
              fetchingRef.current = false;
              fetchScripts(attempt + 1);
            }
          }, 1000 * Math.pow(2, attempt));
          return;
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [user, maxRetries]);

  // Cleanup and fetch logic
  useEffect(() => {
    isMountedRef.current = true;
    toastShownRef.current = false;
    
    // Only fetch if we have a user and haven't started fetching
    if (user && !fetchingRef.current) {
      fetchScripts();
    }

    return () => {
      isMountedRef.current = false;
      fetchingRef.current = false;
    };
  }, [user, fetchScripts]);

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    retryCount
  };
}
