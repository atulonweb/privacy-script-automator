
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Webhook } from '@/types/webhook.types';

export function useWebhookOperations(userId: string | undefined) {
  const createWebhook = async (newWebhook: {
    website_id: string;
    url: string;
    secret?: string;
    enabled?: boolean;
    retry_count?: number;
  }) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to create a webhook"
        });
        throw new Error('User not authenticated');
      }
      
      // Create the webhook
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          ...newWebhook,
          user_id: userId,
          enabled: newWebhook.enabled ?? true,
          retry_count: newWebhook.retry_count ?? 3
        })
        .select();
      
      if (error) throw error;
      
      console.log('Created webhook:', data);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create webhook');
      }
      
      // Return the created webhook
      const newWebhookData = data[0] as Webhook;
      
      toast({
        title: "Success",
        description: "Webhook created successfully"
      });
      
      return newWebhookData;
    } catch (err: any) {
      console.error('Error creating webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create webhook"
      });
      throw err;
    }
  };

  const updateWebhook = async (id: string, webhookData: Partial<Webhook>) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to update a webhook"
        });
        throw new Error('User not authenticated');
      }
      
      // Update the webhook
      const { data, error } = await supabase
        .from('webhooks')
        .update(webhookData)
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      
      console.log('Updated webhook:', data);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to update webhook');
      }
      
      // Return the updated webhook
      const updatedWebhook = data[0] as Webhook;
      
      toast({
        title: "Success",
        description: "Webhook updated successfully"
      });
      
      return updatedWebhook;
    } catch (err: any) {
      console.error('Error updating webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update webhook"
      });
      throw err;
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a webhook"
        });
        throw new Error('User not authenticated');
      }
      
      // Delete the webhook
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
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete webhook"
      });
      throw err;
    }
  };

  return {
    createWebhook,
    updateWebhook,
    deleteWebhook
  };
}
