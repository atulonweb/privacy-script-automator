
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Webhook } from '@/types/webhook.types';
import { useFetchWebhooks } from './webhooks/useFetchWebhooks';
import { useWebhookLogs } from './webhooks/useWebhookLogs';
import { useWebhookOperations } from './webhooks/useWebhookOperations';
import { useTestWebhook } from './webhooks/useTestWebhook';

export type { Webhook, WebhookLog } from '@/types/webhook.types';

export function useWebhooks(websiteId?: string) {
  const { user } = useAuth();
  const { 
    webhooks, 
    webhook, 
    setWebhook, 
    loading, 
    error, 
    fetchWebhooks 
  } = useFetchWebhooks(user?.id, websiteId);
  
  const { logs, logsLoading, fetchWebhookLogs } = useWebhookLogs();
  const { createWebhook, updateWebhook, deleteWebhook } = useWebhookOperations(user?.id, fetchWebhooks);
  const { testWebhook, isTesting } = useTestWebhook();

  // Initial fetch of webhooks
  useEffect(() => {
    if (user) {
      fetchWebhooks();
    } else {
      setWebhook(null);
    }
  }, [user, websiteId]);

  // Fetch logs when webhook changes
  useEffect(() => {
    if (webhook) {
      fetchWebhookLogs(webhook.id);
    }
  }, [webhook]);

  // Wrapper for testWebhook to provide fetchWebhookLogs
  const handleTestWebhook = async (id: string) => {
    return testWebhook(id, fetchWebhookLogs);
  };

  return {
    webhooks,
    webhook,
    setWebhook,
    logs,
    loading,
    logsLoading,
    error,
    isTesting,
    fetchWebhooks,
    fetchWebhookLogs,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook: handleTestWebhook
  };
}
