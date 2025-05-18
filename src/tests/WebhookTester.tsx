
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWebhooks } from '@/hooks/useWebhooks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, PlayIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const WebhookTester: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [webhookId, setWebhookId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { testWebhook, isTesting } = useWebhooks().testWebhook ? useWebhooks() : { testWebhook: null, isTesting: false };

  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  // Create or get existing webhook for testing
  const createTestWebhook = async () => {
    if (!webhookUrl || !userId) {
      toast.error('Please enter a webhook URL and make sure you are logged in');
      return;
    }

    try {
      // For testing purposes, we'll create a temporary webhook with a fixed website_id
      const testWebsiteId = '00000000-0000-0000-0000-000000000000';

      // Check if we already have a test webhook
      const { data: existingWebhooks, error: fetchError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId)
        .eq('url', webhookUrl)
        .eq('website_id', testWebsiteId)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      let id;
      if (existingWebhooks && existingWebhooks.length > 0) {
        // Update the existing webhook
        id = existingWebhooks[0].id;
        await supabase
          .from('webhooks')
          .update({ 
            secret: secret || null,
            enabled: true 
          })
          .eq('id', id);
      } else {
        // Create a new webhook
        const { data: newWebhook, error } = await supabase
          .from('webhooks')
          .insert({
            user_id: userId,
            url: webhookUrl,
            secret: secret || null,
            enabled: true,
            retry_count: 3,
            website_id: testWebsiteId // Adding the required website_id field
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        id = newWebhook.id;
      }

      setWebhookId(id);
      return id;
    } catch (err: any) {
      console.error('Error creating/getting webhook:', err);
      toast.error(`Failed to create webhook: ${err.message}`);
      throw err;
    }
  };

  // Test the webhook
  const handleTest = async () => {
    try {
      // Make sure we have a webhook to test
      const id = webhookId || await createTestWebhook();
      
      if (!id || !testWebhook) {
        return;
      }

      // Run the test
      const result = await testWebhook(id);
      
      // Add the result to our test results array
      setTestResults(prev => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          success: result.success,
          message: result.message,
          status: result.status,
          url: webhookUrl
        },
        ...prev
      ]);
      
    } catch (err: any) {
      console.error('Test failed:', err);
      // Still add the failure to our results
      setTestResults(prev => [
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          success: false,
          message: err.message,
          status: 'error',
          url: webhookUrl
        },
        ...prev
      ]);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Webhook Testing Tool</CardTitle>
        <CardDescription>Test webhook delivery and view results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            placeholder="https://example.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret">Secret Key (Optional)</Label>
          <Input
            id="secret"
            type="password"
            placeholder="Enter a secret key to sign the payload"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Test payload will contain the following consent data structure:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
{`{
  "event": "consent.test",
  "timestamp": "2025-05-18T10:00:00Z",
  "ip": "192.0.2.1",
  "siteId": "test_site_id",
  "userId": "test_user_id",
  "sessionId": "test_session_id",
  "userAgent": "ConsentGuard Test Webhook",
  "webhook_id": "[webhook-id]",
  "consent": {
    "necessary": true,
    "analytics": true,
    "functional": true,
    "ads": false,
    "social": false
  }
}`}
          </pre>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={isTesting || !webhookUrl || !userId}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlayIcon className="h-4 w-4" />
          {isTesting ? 'Testing...' : 'Send Test Webhook'}
        </Button>

        {testResults.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Test Results</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="text-sm">
                        {formatTime(result.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={result.success ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {result.success ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {result.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {result.url}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {result.message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookTester;
