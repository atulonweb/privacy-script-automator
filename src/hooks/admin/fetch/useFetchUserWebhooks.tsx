
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook } from '@/types/webhook.types';

export function useFetchUserWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  
  // Use a stable reference for the fetchUserWebhooks function
  const fetchUserWebhooks = useCallback(async (userId: string) => {
    if (!userId) {
      console.error("No user ID provided to fetchUserWebhooks");
      return [];
    }
    
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      console.log("Already fetching webhooks, skipping redundant call");
      return webhooks;
    }
    
    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (webhooksError) {
        console.error("Error fetching webhooks:", webhooksError);
        setError(webhooksError.message);
        setWebhooks([]);
        return [];
      }
      
      // Ensure webhooksData is properly processed
      if (webhooksData && Array.isArray(webhooksData)) {
        const processedWebhooks: Webhook[] = webhooksData.map(webhook => ({
          id: webhook.id,
          user_id: webhook.user_id,
          website_id: webhook.website_id,
          url: webhook.url,
          secret: webhook.secret,
          enabled: webhook.enabled,
          retry_count: webhook.retry_count,
          created_at: webhook.created_at,
          updated_at: webhook.updated_at
        }));
        
        setWebhooks(processedWebhooks);
        return processedWebhooks;
      } else {
        setWebhooks([]);
        return [];
      }
    } catch (error: any) {
      console.error("Failed to fetch webhooks:", error);
      setError(error.message);
      setWebhooks([]);
      return [];
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, []); // Empty dependency array to ensure stability
  
  return {
    webhooks,
    setWebhooks,
    fetchUserWebhooks,
    isLoading,
    error
  };
}
