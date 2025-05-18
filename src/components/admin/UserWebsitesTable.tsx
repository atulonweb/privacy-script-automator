
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export interface Website {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
}

interface UserWebsitesTableProps {
  websites: Website[];
}

const UserWebsitesTable: React.FC<UserWebsitesTableProps> = ({ websites }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.length > 0 ? (
            websites.map((website) => (
              <TableRow key={website.id}>
                <TableCell className="font-medium">{website.name}</TableCell>
                <TableCell>{website.domain}</TableCell>
                <TableCell>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${website.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {website.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>{formatDate(website.created_at)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No websites found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserWebsitesTable;
