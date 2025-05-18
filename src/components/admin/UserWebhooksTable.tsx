
import React, { useMemo } from 'react';
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Safety check to ensure webhooks is an array
  const safeWebhooks = useMemo(() => Array.isArray(webhooks) ? webhooks : [], [webhooks]);
  const safeWebsites = useMemo(() => Array.isArray(websites) ? websites : [], [websites]);

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
          {safeWebhooks.length > 0 ? (
            safeWebhooks.map((webhook) => {
              // Find the website name for this webhook
              const website = safeWebsites.find(w => w.id === webhook.website_id);
              
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

// Use React.memo with a proper comparison function to prevent unnecessary rerenders
export default React.memo(UserWebhooksTable, (prevProps, nextProps) => {
  // If the arrays have different lengths, they're definitely different
  if (prevProps.webhooks?.length !== nextProps.webhooks?.length) return false;
  if (prevProps.websites?.length !== nextProps.websites?.length) return false;
  
  // If both arrays are empty or null/undefined, they're equal
  if (!prevProps.webhooks?.length && !nextProps.webhooks?.length) return true;
  
  // Compare webhook IDs as a final check
  const prevIds = prevProps.webhooks?.map(w => w.id).join(',') || '';
  const nextIds = nextProps.webhooks?.map(w => w.id).join(',') || '';
  
  return prevIds === nextIds;
});
