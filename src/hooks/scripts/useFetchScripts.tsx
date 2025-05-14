
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ConsentScript } from '@/types/script.types';

export function useFetchScripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ConsentScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastShown, setToastShown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  const fetchScripts = useCallback(async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setScripts([]);
        return;
      }
      
      // Exponential backoff delay calculation
      if (attempt > 0) {
        const backoffTime = Math.min(100 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
      
      const { data, error } = await supabase
        .from('consent_scripts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      console.log("Fetched scripts:", data);
      setScripts(data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching scripts:', err);
      setError(err.message);
      
      // Only show toast once to prevent infinite popups
      if (!toastShown) {
        toast({
          title: "Error",
          description: "Failed to load scripts"
        });
        setToastShown(true);
      }
      
      // Retry logic with exponential backoff
      if (attempt < maxRetries) {
        console.log(`Retrying fetch scripts (attempt ${attempt + 1} of ${maxRetries})...`);
        setRetryCount(attempt + 1);
        return fetchScripts(attempt + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [user, toastShown, maxRetries]);

  // Reset toast shown state when user changes
  useEffect(() => {
    setToastShown(false);
  }, [user]);

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    retryCount
  };
}
