
import React from 'react';
import { Button } from '@/components/ui/button';
import { EyeIcon, PlayIcon } from 'lucide-react';

interface MonitoringTabProps {
  showPreview: boolean;
  togglePreview: () => void;
  consoleLogs: string[];
  cookies: string[];
}

const MonitoringTab = ({
  showPreview,
  togglePreview,
  consoleLogs,
  cookies
}: MonitoringTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Console Logs</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-60 overflow-y-auto">
          {consoleLogs.length > 0 ? (
            consoleLogs.map((log, index) => (
              <div key={index} className="mb-1">&gt; {log}</div>
            ))
          ) : (
            <div className="text-gray-500">No logs available. Start the preview to see logs.</div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cookies</h3>
        <div className="bg-gray-50 p-4 rounded-md h-40 overflow-y-auto">
          {cookies.length > 0 ? (
            <ul className="space-y-2 font-mono text-sm">
              {cookies.map((cookie, index) => (
                <li key={index} className="p-2 bg-white rounded border border-gray-200">
                  {cookie}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No consent cookies found.</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={togglePreview}
          variant={showPreview ? "secondary" : "outline"}
          className="flex-1"
        >
          {showPreview ? (
            <>
              <EyeIcon className="mr-2 h-4 w-4" />
              Stop Monitoring
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Start Monitoring
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MonitoringTab;
