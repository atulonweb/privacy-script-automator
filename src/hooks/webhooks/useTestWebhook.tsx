
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTestWebhook() {
  const [isTesting, setIsTesting] = useState(false);

  const testWebhook = async (id: string, fetchWebhookLogs?: (id: string) => Promise<void>) => {
    try {
      if (!id) {
        toast.error("Invalid webhook ID");
        throw new Error('Invalid webhook ID');
      }
      
      setIsTesting(true);
      const { data: userSession } = await supabase.auth.getSession();
      
      if (!userSession.session) {
        throw new Error('No active session');
      }
      
      console.log("Testing webhook:", id);
      
      // Call the test-webhook function directly
      const response = await fetch("https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/test-webhook", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSession.session.access_token}`
        },
        body: JSON.stringify({ webhookId: id })
      });
      
      // Get the response as text first
      const responseText = await response.text();
      console.log("Raw webhook test response:", responseText);
      
      // Then try to parse it as JSON if possible
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : { success: response.ok };
      } catch (e) {
        console.warn("Failed to parse webhook response as JSON:", e);
        result = { 
          success: response.ok,
          rawResponse: responseText || "(empty response)"
        };
      }
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to test webhook');
      }
      
      // Fetch logs if callback is provided
      if (fetchWebhookLogs) {
        await fetchWebhookLogs(id);
      }
      
      toast.success(result.message || 'Test webhook sent successfully');
      
      return result;
    } catch (err: any) {
      console.error('Error testing webhook:', err);
      toast.error(err.message || "Failed to test webhook");
      throw err;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    testWebhook,
    isTesting
  };
}
