
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Website } from './UserWebsitesTable';
import { Webhook } from '@/types/webhook.types';

interface UserWebhooksTableProps {
  webhooks: Webhook[];
  websites: Website[];
}

const UserWebhooksTable: React.FC<UserWebhooksTableProps> = ({ webhooks, websites }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  console.log('UserWebhooksTable rendering with webhooks:', webhooks);
  console.log('UserWebhooksTable rendering with websites:', websites);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks && webhooks.length > 0 ? (
            webhooks.map((webhook) => {
              // Find the website name for this webhook
              const website = websites.find(w => w.id === webhook.website_id);
              
              return (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium truncate max-w-[300px]">
                    {webhook.url}
                  </TableCell>
                  <TableCell>{website ? website.name : 'All websites'}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${webhook.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {webhook.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(webhook.created_at)}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No webhooks found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserWebhooksTable;
