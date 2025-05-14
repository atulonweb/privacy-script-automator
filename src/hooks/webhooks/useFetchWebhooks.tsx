
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Webhook } from '@/types/webhook.types';

export function useFetchWebhooks(userId: string | undefined, websiteId?: string) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setWebhooks([]);
        return;
      }
      
      let query = supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (websiteId) {
        query = query.eq('website_id', websiteId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Fetched webhooks:", data);
      setWebhooks(data as Webhook[] || []);
      
      // If we have exactly one webhook and it's for the specified website, set it as the current webhook
      if (data && data.length === 1 && websiteId) {
        setWebhook(data[0] as Webhook);
      }
    } catch (err: any) {
      console.error('Error fetching webhooks:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    webhooks,
    webhook,
    setWebhook,
    loading,
    error,
    fetchWebhooks
  };
}
