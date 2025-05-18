
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook } from '@/types/webhook.types';
import { ScrollArea } from '@/components/ui/scroll-area';

const UserWebhooksTest: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const fetchWebhooksForUser = async () => {
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      setDebugInfo(`Fetching webhooks for user ID: ${userId}...`);

      // First fetch the user profile to check if the user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setDebugInfo(prevInfo => `${prevInfo}\nError fetching user profile: ${profileError.message}`);
        toast.error(`User not found: ${profileError.message}`);
        setIsLoading(false);
        return;
      }

      // Then fetch the webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);

      if (webhooksError) {
        setDebugInfo(prevInfo => `${prevInfo}\nError fetching webhooks: ${webhooksError.message}`);
        toast.error(`Failed to fetch webhooks: ${webhooksError.message}`);
        setIsLoading(false);
        return;
      }

      setDebugInfo(prevInfo => `${prevInfo}\nFetched data: ${JSON.stringify(webhooksData, null, 2)}`);
      
      if (webhooksData && Array.isArray(webhooksData)) {
        setWebhooks(webhooksData as Webhook[]);
        toast.success(`Found ${webhooksData.length} webhooks for this user`);
      } else {
        setWebhooks([]);
        toast.info('No webhooks found for this user');
      }
    } catch (error: any) {
      setDebugInfo(prevInfo => `${prevInfo}\nUnexpected error: ${error.message}`);
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestWebhook = async () => {
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      setDebugInfo(`Creating a test webhook for user ID: ${userId}...`);

      // First, check if we need to create a test website for this user
      let websiteId: string;
      const { data: websites } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!websites || websites.length === 0) {
        // Create a test website first
        const { data: newWebsite, error: websiteError } = await supabase
          .from('websites')
          .insert({
            user_id: userId,
            name: 'Test Website',
            domain: `test-${Date.now()}.example.com`,
            active: true
          })
          .select()
          .single();

        if (websiteError) {
          setDebugInfo(prevInfo => `${prevInfo}\nError creating test website: ${websiteError.message}`);
          throw websiteError;
        }

        websiteId = newWebsite.id;
        setDebugInfo(prevInfo => `${prevInfo}\nCreated test website with ID: ${websiteId}`);
      } else {
        websiteId = websites[0].id;
        setDebugInfo(prevInfo => `${prevInfo}\nUsing existing website with ID: ${websiteId}`);
      }

      // Now create the webhook
      const { data: webhook, error: webhookError } = await supabase
        .from('webhooks')
        .insert({
          user_id: userId,
          website_id: websiteId,
          url: `https://webhook-test-${Date.now()}.example.com/webhook`,
          enabled: true,
          retry_count: 3
        })
        .select()
        .single();

      if (webhookError) {
        setDebugInfo(prevInfo => `${prevInfo}\nError creating webhook: ${webhookError.message}`);
        throw webhookError;
      }

      setDebugInfo(prevInfo => `${prevInfo}\nSuccessfully created webhook: ${JSON.stringify(webhook, null, 2)}`);
      toast.success('Test webhook created successfully!');
      
      // Refresh the webhooks list
      fetchWebhooksForUser();
    } catch (error: any) {
      setDebugInfo(prevInfo => `${prevInfo}\nError: ${error.message}`);
      toast.error(`Failed to create test webhook: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      setIsLoading(true);
      setDebugInfo(`Deleting webhook with ID: ${webhookId}...`);

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) {
        setDebugInfo(prevInfo => `${prevInfo}\nError deleting webhook: ${error.message}`);
        throw error;
      }

      setDebugInfo(prevInfo => `${prevInfo}\nSuccessfully deleted webhook: ${webhookId}`);
      toast.success('Webhook deleted successfully!');
      
      // Refresh the webhooks list
      fetchWebhooksForUser();
    } catch (error: any) {
      setDebugInfo(prevInfo => `${prevInfo}\nError: ${error.message}`);
      toast.error(`Failed to delete webhook: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>User Webhooks Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchWebhooksForUser} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Fetch Webhooks'}
            </Button>
            <Button onClick={createTestWebhook} disabled={isLoading} variant="outline">
              Create Test Webhook
            </Button>
          </div>

          {webhooks.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Found {webhooks.length} Webhooks:</h3>
              <div className="border rounded-md p-4 space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p><strong>URL:</strong> {webhook.url}</p>
                        <p><strong>Website ID:</strong> {webhook.website_id}</p>
                        <p><strong>Enabled:</strong> {webhook.enabled ? 'Yes' : 'No'}</p>
                        <p><strong>Created:</strong> {formatDate(webhook.created_at)}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">No webhooks found for this user</p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Debug Information:</h3>
            <ScrollArea className="h-[200px] border rounded-md bg-slate-50 p-4">
              <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWebhooksTest;
