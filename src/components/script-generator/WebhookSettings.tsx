
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWebhooks, Webhook, WebhookLog } from '@/hooks/useWebhooks';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SendIcon, PlayIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Website } from '@/hooks/useWebsites';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import usePlanLimits from '@/hooks/usePlanLimits';

interface WebhookSettingsProps {
  website: Website;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ website }) => {
  const { 
    webhook, 
    logs, 
    loading,
    logsLoading,
    createWebhook, 
    updateWebhook,
    deleteWebhook,
    testWebhook,
    fetchWebhookLogs,
    fetchWebhooks
  } = useWebhooks(website.id);
  
  const { planDetails, enforcePlanLimits, userPlan } = usePlanLimits();

  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  // Update local state when webhook data changes
  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setSecret(webhook.secret || '');
      setEnabled(webhook.enabled);
      setRetryCount(webhook.retry_count);
    } else {
      // Reset to defaults when no webhook is available
      setUrl('');
      setSecret('');
      setEnabled(true);
      setRetryCount(3);
    }
  }, [webhook]);

  const handleSave = async () => {
    // Check plan limits first
    if (!enforcePlanLimits.canUseWebhooks()) {
      return;
    }

    if (!url) {
      toast({
        title: "Error",
        description: "Webhook URL is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        toast({
          title: "Error",
          description: "Invalid URL format",
          variant: "destructive"
        });
        return;
      }
      
      // Check if the URL is HTTPS (security requirement) unless it's localhost
      if (!url.startsWith('https://') && !url.includes('localhost')) {
        toast({
          title: "Warning",
          description: "For security reasons, production webhooks should use HTTPS",
          variant: "default"
        });
        // Not returning here as we'll allow it but with a warning
      }

      if (webhook) {
        // Update existing webhook
        await updateWebhook(webhook.id, {
          url,
          secret: secret || null,
          enabled,
          retry_count: retryCount
        });
      } else {
        // Create new webhook
        await createWebhook({
          website_id: website.id,
          url,
          secret: secret || null,
          enabled,
          retry_count: retryCount
        });
      }
      
      // Refresh webhooks after saving
      fetchWebhooks();
      
    } catch (error) {
      console.error('Error saving webhook:', error);
      // Toast is already shown by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhook) {
      toast({
        title: "Error",
        description: "Please save the webhook before testing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTesting(true);
      await testWebhook(webhook.id);
      setActiveTab('logs');
    } catch (error) {
      console.error('Error testing webhook:', error);
      // Toast is already shown by the hook
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!webhook) return;
    
    if (confirm('Are you sure you want to delete this webhook?')) {
      try {
        await deleteWebhook(webhook.id);
        setUrl('');
        setSecret('');
        setEnabled(true);
        setRetryCount(3);
      } catch (error) {
        console.error('Error deleting webhook:', error);
        // Toast is already shown by the hook
      }
    }
  };

  const handleRefreshLogs = () => {
    if (webhook) {
      fetchWebhookLogs(webhook.id);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return String(json);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Webhook Configuration</CardTitle>
        <CardDescription>
          Set up a webhook to notify your systems when consent preferences are updated
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs" disabled={!webhook}>Logs</TabsTrigger>
          <TabsTrigger value="help">Documentation</TabsTrigger>
        </TabsList>

        <CardContent className="pt-6">
          <TabsContent value="settings" className="space-y-4">
            {/* Plan limit warning */}
            {!planDetails.webhooksEnabled && (
              <Alert className="border-amber-500 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  <strong>Webhooks Not Available:</strong> Webhooks are not available on your {userPlan} plan. 
                  <br />Please upgrade to a plan that includes webhook functionality to configure webhooks for this website.
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/plans'}>
                      View Plans
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input 
                id="webhookUrl" 
                placeholder="https://example.com/webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={!planDetails.webhooksEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Your server endpoint that will receive consent update notifications
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookSecret">Webhook Secret Key (Optional)</Label>
              <Input 
                id="webhookSecret"
                type="password" 
                placeholder="Enter a secret key to sign payloads"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                disabled={!planDetails.webhooksEnabled}
              />
              <p className="text-sm text-muted-foreground">
                If provided, all webhook payloads will be signed with an HMAC signature
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retryCount">Retry Attempts</Label>
              <Input 
                id="retryCount" 
                type="number"
                min={0}
                max={10}
                value={retryCount}
                onChange={(e) => setRetryCount(Number(e.target.value))}
                disabled={!planDetails.webhooksEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Number of times to retry if the webhook fails (0 for no retries)
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="webhookEnabled" 
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={!planDetails.webhooksEnabled}
              />
              <Label htmlFor="webhookEnabled">Enable webhook</Label>
            </div>

            <div className="pt-4 flex gap-2 justify-between">
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={!webhook || isSaving}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={!webhook || isSaving || isTesting}
                  className="flex gap-2"
                >
                  <PlayIcon className="h-4 w-4" />
                  {isTesting ? 'Testing...' : 'Test Webhook'}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !planDetails.webhooksEnabled}
                  className="flex gap-2"
                >
                  <SendIcon className="h-4 w-4" />
                  {isSaving ? 'Saving...' : webhook ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Webhook Deliveries</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshLogs}
                disabled={logsLoading}
                className="h-8 px-2 text-xs"
              >
                <RefreshCwIcon className={`h-4 w-4 mr-1 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No webhook logs yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivery attempts will appear here
                </p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="hidden md:table-cell">Event Type</TableHead>
                      <TableHead className="hidden md:table-cell">Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const eventType = log.request_payload?.event || 'unknown';
                      const hasResponse = log.response_body || log.parsed_response;
                      
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant={log.status === 'success' ? 'default' : 'destructive'}
                                    className="flex items-center gap-1"
                                  >
                                    {log.status === 'success' ? (
                                      <CheckCircleIcon className="h-3 w-3" />
                                    ) : (
                                      <XCircleIcon className="h-3 w-3" />
                                    )}
                                    {log.status}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{log.status_code ? `HTTP ${log.status_code}` : 'No response code'}</p>
                                  {log.error_message && (
                                    <p className="text-xs mt-1">{log.error_message}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTimestamp(log.created_at)}
                            {log.is_test && (
                              <Badge variant="outline" className="ml-2 text-xs">Test</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {eventType}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[500px]">
                                  <div className="space-y-2">
                                    <div>
                                      <p className="font-semibold text-xs">Request Payload:</p>
                                      <p className="font-mono text-xs whitespace-pre-wrap">
                                        {formatJson(log.request_payload)}
                                      </p>
                                    </div>
                                    
                                    {hasResponse && (
                                      <div>
                                        <p className="font-semibold text-xs mt-2">Response:</p>
                                        <p className="font-mono text-xs whitespace-pre-wrap">
                                          {formatJson(log.parsed_response || log.response_body)}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {!hasResponse && log.status === 'success' && (
                                      <p className="text-xs italic">No response data available</p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">What are webhooks?</p>
                <p className="text-sm text-muted-foreground">
                  Webhooks are a way for our system to notify your application when a consent event occurs.
                  When a user updates their consent preferences, we'll send an HTTP POST request to your specified URL
                  with details about the consent change.
                </p>
              </AlertDescription>
            </Alert>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Webhook Payload Format</h3>
              <p className="text-sm text-muted-foreground">
                When a consent event occurs, we'll send a JSON payload to your webhook URL with the following structure:
              </p>

              <ScrollArea className="h-[400px] rounded-md border p-4">
                <pre className="text-xs font-mono">
{`{
  "event": "consent.updated",
  "timestamp": "2025-05-14T10:22:00Z",
  "scriptId": "script_12345",
  "visitorId": "visitor_abc123",
  "userId": "custom_user_456",
  "websiteId": "custom_website_789",
  "sessionId": "session_xyz890",
  "choice": "partial",
  "preferences": {
    "necessary": true,
    "analytics": false,
    "functional": true,
    "ads": false,
    "social": false
  }
}`}
                </pre>
              </ScrollArea>

              <div className="space-y-2 pt-4">
                <h4 className="font-medium">Custom User & Website IDs</h4>
                <p className="text-sm text-muted-foreground">
                  You can specify custom <code className="bg-muted px-1 py-0.5 rounded">userId</code> and <code className="bg-muted px-1 py-0.5 rounded">websiteId</code> values that will be included in webhook payloads. 
                  This allows you to map consent events to your own user and website identifiers.
                </p>
                
                <div className="mt-3">
                  <h5 className="font-medium text-sm">Method 1: Global JavaScript Variables</h5>
                  <div className="bg-gray-100 p-3 rounded-md mt-2">
                    <pre className="text-xs font-mono">
{`<script>
window.ConsentGuard = {
  userId: 'your-custom-user-id',
  websiteId: 'your-custom-website-id'
};
</script>`}
                    </pre>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="font-medium text-sm">Method 2: Data Attributes on Script Tag</h5>
                  <div className="bg-gray-100 p-3 rounded-md mt-2">
                    <pre className="text-xs font-mono">
{`<script 
  src="your-script-url"
  data-user-id="your-custom-user-id"
  data-website-id="your-custom-website-id">
</script>`}
                    </pre>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Note:</strong> Global variables take priority over data attributes. If neither is provided, these fields will be <code className="bg-muted px-1 py-0.5 rounded">null</code> in the webhook payload.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <h4 className="font-medium">Event Types</h4>
                <p className="text-sm text-muted-foreground">
                  Possible event types include:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li><strong>consent.accept</strong> - User accepted all cookies</li>
                  <li><strong>consent.reject</strong> - User rejected non-essential cookies</li>
                  <li><strong>consent.partial</strong> - User customized their consent preferences</li>
                  <li><strong>consent.test</strong> - Test event from the dashboard</li>
                </ul>
              </div>

              <div className="space-y-2 pt-4">
                <h4 className="font-medium">Security</h4>
                <p className="text-sm text-muted-foreground">
                  If you provide a webhook secret, we'll include an HMAC signature in the 
                  <span className="font-mono text-xs"> X-Consent-Signature</span> header.
                  This signature is a SHA-256 HMAC of the entire request body using your secret key.
                </p>
                <p className="text-sm text-muted-foreground pt-2">
                  You should verify this signature before processing the webhook to ensure it came from us:
                </p>

                <div className="bg-gray-100 p-4 rounded-md mt-2">
                  <p className="font-mono text-xs">
                    {`// Node.js example
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default WebhookSettings;
