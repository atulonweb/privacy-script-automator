
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook } from '@/types/webhook.types';

export function useFetchUserWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserWebhooks = async (userId: string) => {
    if (!userId) {
      console.error("No user ID provided to fetchUserWebhooks");
      return [];
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching webhooks for user ID: ${userId}`);
      
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (webhooksError) {
        console.error("Error fetching webhooks:", webhooksError);
        setError(webhooksError.message);
        toast.error(`Failed to fetch webhooks: ${webhooksError.message}`);
        setWebhooks([]);
        return [];
      }
      
      console.log("Raw webhooks data:", webhooksData);
      
      // Ensure webhooksData is properly processed
      if (webhooksData && Array.isArray(webhooksData)) {
        console.log(`Found ${webhooksData.length} webhooks for user ${userId}`);
        
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
        
        console.log("Processed webhooks:", processedWebhooks);
        setWebhooks(processedWebhooks);
        return processedWebhooks;
      } else {
        console.log(`No webhooks found for user ${userId} or invalid data format`);
        setWebhooks([]);
        return [];
      }
    } catch (error: any) {
      console.error("Failed to fetch webhooks:", error);
      setError(error.message);
      toast.error(`Failed to fetch webhooks: ${error.message}`);
      setWebhooks([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    webhooks,
    setWebhooks,
    fetchUserWebhooks,
    isLoading,
    error
  };
}
