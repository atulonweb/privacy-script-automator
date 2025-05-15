
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Webhook } from '@/types/webhook.types';

export function useWebhookOperations(userId: string | undefined, onSuccessCallback?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);

  const createWebhook = async (data: Omit<Partial<Webhook>, 'user_id' | 'url' | 'website_id'> & { url: string, website_id: string }) => {
    try {
      setIsProcessing(true);
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      const webhook = {
        user_id: userId,
        url: data.url,
        website_id: data.website_id,
        secret: data.secret || null,
        enabled: data.enabled !== undefined ? data.enabled : true,
        retry_count: data.retry_count !== undefined ? data.retry_count : 3,
      };
      
      const { data: newWebhook, error } = await supabase
        .from('webhooks')
        .insert(webhook)
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Webhook created successfully"
      });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
      return newWebhook as Webhook;
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateWebhook = async (id: string, data: Partial<Webhook>) => {
    try {
      setIsProcessing(true);
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      const { data: updatedWebhook, error } = await supabase
        .from('webhooks')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Webhook updated successfully"
      });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
      return updatedWebhook as Webhook;
    } catch (error: any) {
      console.error('Error updating webhook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      setIsProcessing(true);
      
      if (!userId) {
        throw new Error('User authentication required');
      }
      
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Webhook deleted successfully"
      });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    createWebhook,
    updateWebhook,
    deleteWebhook
  };
}
