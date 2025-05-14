
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export type Webhook = {
  id: string;
  user_id: string;
  website_id: string;
  url: string;
  secret: string | null;
  enabled: boolean;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

export type WebhookLog = {
  id: string;
  webhook_id: string;
  status: 'success' | 'error' | 'pending';
  status_code: number | null;
  attempt: number;
  is_test: boolean;
  error_message: string | null;
  request_payload: any;
  response_body: string | null;
  created_at: string;
};

export function useWebhooks(websiteId?: string) {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setWebhooks([]);
        return;
      }
      
      let query = supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id);
      
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
        description: "Failed to load webhook logs",
        variant: "destructive"
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const createWebhook = async (newWebhook: {
    website_id: string;
    url: string;
    secret?: string;
    enabled?: boolean;
    retry_count?: number;
  }) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a webhook",
          variant: "destructive"
        });
        throw new Error('User not authenticated');
      }
      
      // Create the webhook
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          ...newWebhook,
          user_id: user.id,
          enabled: newWebhook.enabled ?? true,
          retry_count: newWebhook.retry_count ?? 3
        })
        .select();
      
      if (error) throw error;
      
      console.log('Created webhook:', data);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create webhook');
      }
      
      // Update local state
      const newWebhookData = data[0] as Webhook;
      setWebhooks(prev => [...prev, newWebhookData]);
      setWebhook(newWebhookData);
      
      toast({
        title: "Success",
        description: "Webhook created successfully"
      });
      
      return newWebhookData;
    } catch (err: any) {
      console.error('Error creating webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create webhook",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateWebhook = async (id: string, webhookData: Partial<Webhook>) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update a webhook",
          variant: "destructive"
        });
        throw new Error('User not authenticated');
      }
      
      // Update the webhook
      const { data, error } = await supabase
        .from('webhooks')
        .update(webhookData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) throw error;
      
      console.log('Updated webhook:', data);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to update webhook');
      }
      
      // Update local state
      const updatedWebhook = data[0] as Webhook;
      setWebhooks(prev => prev.map(w => w.id === id ? updatedWebhook : w));
      if (webhook && webhook.id === id) {
        setWebhook(updatedWebhook);
      }
      
      toast({
        title: "Success",
        description: "Webhook updated successfully"
      });
      
      return updatedWebhook;
    } catch (err: any) {
      console.error('Error updating webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update webhook",
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a webhook",
          variant: "destructive"
        });
        throw new Error('User not authenticated');
      }
      
      // Delete the webhook
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setWebhooks(prev => prev.filter(w => w.id !== id));
      if (webhook && webhook.id === id) {
        setWebhook(null);
      }
      
      toast({
        title: "Success",
        description: "Webhook deleted successfully"
      });
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete webhook",
        variant: "destructive"
      });
      throw err;
    }
  };

  const testWebhook = async (id: string) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to test a webhook",
          variant: "destructive"
        });
        throw new Error('User not authenticated');
      }
      
      const { data: userSession } = await supabase.auth.getSession();
      
      if (!userSession.session) {
        throw new Error('No active session');
      }
      
      // Call the test webhook endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/consent-config/test-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.session.access_token}`
        },
        body: JSON.stringify({ webhookId: id })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to test webhook');
      }
      
      // Update logs after test
      fetchWebhookLogs(id);
      
      toast({
        title: result.success ? "Success" : "Error",
        description: result.success 
          ? "Test webhook sent successfully" 
          : `Failed to send test webhook: ${result.error || 'Unknown error'}`
      });
      
      return result;
    } catch (err: any) {
      console.error('Error testing webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to test webhook",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchWebhooks();
    } else {
      setWebhooks([]);
      setWebhook(null);
      setLoading(false);
    }
  }, [user, websiteId]);

  useEffect(() => {
    if (webhook) {
      fetchWebhookLogs(webhook.id);
    } else {
      setLogs([]);
    }
  }, [webhook]);

  return {
    webhooks,
    webhook,
    setWebhook,
    logs,
    loading,
    logsLoading,
    error,
    fetchWebhooks,
    fetchWebhookLogs,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  };
}
