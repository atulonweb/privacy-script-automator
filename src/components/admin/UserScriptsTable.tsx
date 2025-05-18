
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

export interface Script {
  id: string;
  script_id: string;
  website_id: string;
  banner_position: string;
  banner_color: string;
  created_at: string;
}

interface UserScriptsTableProps {
  scripts: Script[];
  websites: Website[];
}

const UserScriptsTable: React.FC<UserScriptsTableProps> = ({ scripts, websites }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Script ID</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scripts.length > 0 ? (
            scripts.map((script) => {
              // Find the website name for this script
              const website = websites.find(w => w.id === script.website_id);
              
              return (
                <TableRow key={script.id}>
                  <TableCell className="font-medium">{script.script_id}</TableCell>
                  <TableCell>{website ? website.name : 'Unknown website'}</TableCell>
                  <TableCell>{script.banner_position || 'Default'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: script.banner_color || '#4F46E5' }}
                      ></div>
                      <span>{script.banner_color || 'Default'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(script.created_at)}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No scripts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserScriptsTable;
