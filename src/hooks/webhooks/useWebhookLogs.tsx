
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WebhookLog } from '@/types/webhook.types';

export function useWebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchWebhookLogs = async (webhookId: string) => {
    try {
      setLogsLoading(true);
      
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      console.log("Fetched webhook logs:", data);
      setLogs(data as WebhookLog[] || []);
    } catch (err: any) {
      console.error('Error fetching webhook logs:', err);
      toast({
        title: "Error",
        description: "Failed to load webhook logs"
      });
    } finally {
      setLogsLoading(false);
    }
  };

  return {
    logs,
    logsLoading,
    fetchWebhookLogs
  };
}
