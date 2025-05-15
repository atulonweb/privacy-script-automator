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
      
      // Process logs to extract response data if available
      const processedLogs = (data as WebhookLog[] || []).map(log => {
        if (log.response_body) {
          try {
            // Try to parse the response_body as JSON
            const parsedResponse = JSON.parse(log.response_body);
            log.parsed_response = parsedResponse;
          } catch (e) {
            // If parsing fails, keep the original response_body
            console.log("Failed to parse log response body:", log.response_body);
          }
        }
        return log;
      });
      
      setLogs(processedLogs);
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
