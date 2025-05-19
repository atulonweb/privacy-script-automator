
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConsentLog } from '@/hooks/admin/useConsentLogs';
import { format, parseISO } from 'date-fns';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface ConsentLogsTableProps {
  logs: ConsentLog[];
}

const ConsentLogsTable: React.FC<ConsentLogsTableProps> = ({ logs }) => {
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 10;
  
  const paginatedLogs = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return logs.slice(startIndex, startIndex + itemsPerPage);
  }, [logs, page]);
  
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'accept':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Accept</span>;
      case 'reject':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Reject</span>;
      case 'partial':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Partial</span>;
      case 'view':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">View</span>;
      case 'ping':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Ping</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{eventType}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Visitor ID</TableHead>
              <TableHead>Language</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(parseISO(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell className="font-medium">
                  {log.domain}
                </TableCell>
                <TableCell>
                  {getEventTypeLabel(log.event_type)}
                </TableCell>
                <TableCell>
                  {log.region || 'Unknown'}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.visitor_id ? 
                    `${log.visitor_id.substring(0, 8)}...` : 
                    'Not tracked'}
                </TableCell>
                <TableCell>
                  {log.language || 'Not specified'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {/* Fix 1: Remove the disabled prop and use className to style it when disabled instead */}
              <PaginationPrevious 
                onClick={() => page > 1 ? setPage((p) => p - 1) : undefined} 
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              // Show first page, last page, and pages around current page
              let pageToShow = i + 1;
              
              if (totalPages > 5) {
                if (page <= 3) {
                  // Show first 5 pages
                  pageToShow = i + 1;
                } else if (page >= totalPages - 2) {
                  // Show last 5 pages
                  pageToShow = totalPages - 4 + i;
                } else {
                  // Show 2 pages before and after current page
                  pageToShow = page - 2 + i;
                }
              }
              
              return (
                <PaginationItem key={`page-${pageToShow}`}>
                  <PaginationLink 
                    isActive={pageToShow === page}
                    onClick={() => setPage(pageToShow)}
                  >
                    {pageToShow}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              {/* Fix 2: Remove the disabled prop and use className to style it when disabled instead */}
              <PaginationNext 
                onClick={() => page < totalPages ? setPage((p) => p + 1) : undefined}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ConsentLogsTable;
