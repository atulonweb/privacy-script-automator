
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

type WebhookLog = {
  id: string;
  webhook_id: string;
  created_at: string;
  status: string;
  status_code: number | null;
  error_message: string | null;
  is_test: boolean;
  attempt: number;
  website_name?: string;
  url?: string;
  request_payload?: any;
  response_body?: string;
};

const AdminWebhooksPage = () => {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  const fetchWebhookLogs = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      console.log("Starting to fetch webhook logs");
      
      // Get all webhook logs with most recent first
      const { data: logs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (logsError) {
        console.error("Error fetching webhook logs:", logsError);
        throw logsError;
      }
      
      console.log("Fetched webhook logs:", logs);
      
      if (!logs || logs.length === 0) {
        setWebhookLogs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Extract all webhook IDs from logs to fetch webhook details
      const webhookIds = [...new Set(logs.map(log => log.webhook_id))];
      
      // Get all webhooks to map webhook_id to url and website_id
      const { data: webhooks, error: webhooksError } = await supabase
        .from('webhooks')
        .select('id, url, website_id')
        .in('id', webhookIds);
        
      if (webhooksError) {
        console.error("Error fetching webhooks:", webhooksError);
        throw webhooksError;
      }
      
      console.log("Fetched webhooks:", webhooks);
      
      const webhookMap = new Map();
      webhooks?.forEach(webhook => {
        webhookMap.set(webhook.id, {
          url: webhook.url,
          website_id: webhook.website_id
        });
      });
      
      // Get all website IDs from webhooks to fetch website names
      const websiteIds = [...new Set(webhooks?.map(webhook => webhook.website_id).filter(id => id) || [])];
      
      // Get all websites to map website_id to name
      let websiteMap = new Map();
      
      if (websiteIds.length > 0) {
        const { data: websites, error: websitesError } = await supabase
          .from('websites')
          .select('id, name')
          .in('id', websiteIds);
          
        if (websitesError) {
          console.error("Error fetching websites:", websitesError);
          throw websitesError;
        }
        
        console.log("Fetched websites:", websites);
        
        websites?.forEach(website => {
          websiteMap.set(website.id, website.name);
        });
      }
      
      // Enhance logs with webhook details
      const enhancedLogs = logs.map(log => {
        const webhookInfo = webhookMap.get(log.webhook_id) || { url: 'Unknown URL', website_id: null };
        const websiteName = webhookInfo.website_id ? (websiteMap.get(webhookInfo.website_id) || 'Unknown Website') : 'Unknown Website';
        
        return {
          ...log,
          url: webhookInfo.url,
          website_name: websiteName
        };
      });
      
      console.log("Enhanced webhook logs with website data:", enhancedLogs);
      
      setWebhookLogs(enhancedLogs);
    } catch (error: any) {
      console.error('Error fetching webhook logs:', error);
      toast.error(`Failed to load webhook logs: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string, statusCode: number | null) => {
    if (status === 'success') return 'bg-green-100 text-green-800';
    if (statusCode && statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode && statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Webhook Monitoring</h2>
          <Button 
            onClick={fetchWebhookLogs} 
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Logs'}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Webhook Delivery Logs</CardTitle>
            <CardDescription>
              Monitor webhook delivery status and troubleshoot issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Website</TableHead>
                    <TableHead>Webhook URL</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.website_name}</TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {log.url}
                      </TableCell>
                      <TableCell>{formatDateTime(log.created_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(log.status, log.status_code)}
                        >
                          {log.status} {log.status_code ? `(${log.status_code})` : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.attempt}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={log.is_test ? 'bg-blue-100 text-blue-800' : ''}>
                          {log.is_test ? 'Test' : 'Live'}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {webhookLogs.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No webhook logs found. Try sending test webhook calls from the Webhooks tab in user settings.
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {loading && !refreshing && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        Loading webhook logs...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWebhooksPage;
