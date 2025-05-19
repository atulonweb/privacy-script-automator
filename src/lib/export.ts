
import { ConsentLog } from "@/hooks/admin/useConsentLogs";
import { format, parseISO } from "date-fns";

/**
 * Helper function to create and trigger a download
 */
const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: ConsentLog[], fileName: string) => {
  if (!data.length) return;

  // Define CSV headers
  const headers = [
    'Date & Time',
    'Domain',
    'Event Type',
    'Region',
    'Visitor ID',
    'Session ID',
    'URL',
    'Language',
    'User Agent'
  ];

  // Convert data to CSV rows
  const rows = data.map(log => [
    format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    log.domain,
    log.event_type,
    log.region || 'Unknown',
    log.visitor_id || 'Not tracked',
    log.session_id || 'Not tracked',
    log.url || 'N/A',
    log.language || 'Not specified',
    log.user_agent || 'Not tracked'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => 
        // Handle cases where cells might contain commas or quotes
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(',')
    )
  ].join('\n');

  // Create file name with timestamp
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const fullFileName = `${fileName}-${timestamp}.csv`;
  
  downloadFile(csvContent, fullFileName, 'text/csv;charset=utf-8');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: ConsentLog[], fileName: string) => {
  if (!data.length) return;

  // Format the data for better readability
  const formattedData = data.map(log => ({
    ...log,
    created_at_formatted: format(parseISO(log.created_at), 'yyyy-MM-dd HH:mm:ss')
  }));

  const jsonContent = JSON.stringify(formattedData, null, 2);
  
  // Create file name with timestamp
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const fullFileName = `${fileName}-${timestamp}.json`;
  
  downloadFile(jsonContent, fullFileName, 'application/json');
};
