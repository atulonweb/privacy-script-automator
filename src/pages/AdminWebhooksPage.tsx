
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
};

const AdminWebhooksPage = () => {
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

  const fetchWebhookLogs = async () => {
    try {
      setLoading(true);
      
      // Get all webhook logs
      const { data: logs, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (logsError) throw logsError;
      
      if (!logs || logs.length === 0) {
        setWebhookLogs([]);
        return;
      }
      
      // Get all webhooks to map webhook_id to url and website_id
      const { data: webhooks, error: webhooksError } = await supabase
        .from('webhooks')
        .select('id, url, website_id');
        
      if (webhooksError) throw webhooksError;
      
      const webhookMap = new Map();
      webhooks?.forEach(webhook => {
        webhookMap.set(webhook.id, {
          url: webhook.url,
          website_id: webhook.website_id
        });
      });
      
      // Get all websites to map website_id to name
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('id, name');
        
      if (websitesError) throw websitesError;
      
      const websiteMap = new Map();
      websites?.forEach(website => {
        websiteMap.set(website.id, website.name);
      });
      
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
      
      setWebhookLogs(enhancedLogs);
    } catch (error: any) {
      console.error('Error fetching webhook logs:', error);
      toast.error(`Failed to load webhook logs: ${error.message}`);
    } finally {
      setLoading(false);
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
          <Button onClick={fetchWebhookLogs} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Logs'}
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
                        No webhook logs found
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {loading && (
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
