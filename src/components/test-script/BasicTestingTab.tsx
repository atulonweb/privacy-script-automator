
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlayIcon, EyeIcon } from 'lucide-react';
import { generateCdnUrl } from '@/lib/utils';
import { ConsentScript } from '@/hooks/useScripts';

interface BasicTestingTabProps {
  scriptData: ConsentScript | null;
  showPreview: boolean;
  togglePreview: () => void;
  testError: string | null;
}

const BasicTestingTab = ({ 
  scriptData,
  showPreview,
  togglePreview,
  testError
}: BasicTestingTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
        {scriptData && `<script src="${generateCdnUrl(scriptData.script_id)}" async></script>`}
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
              Hide Preview
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Test Script
            </>
          )}
        </Button>
      </div>
      
      {testError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {testError}
          </AlertDescription>
        </Alert>
      )}
      
      {showPreview && !testError && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 font-medium mb-2">
            Preview Active
          </p>
          <p className="text-sm text-green-700">
            A consent banner should appear at the bottom of this page. Features:
          </p>
          <ul className="list-disc list-inside text-sm text-green-700 mt-2">
            <li>Click "Customize" in the banner to open the settings panel with cookie categories</li>
            <li>Toggle cookie categories on/off in the customize panel</li>
            <li>Use "Save Preferences", "Accept All", or "Reject All" buttons in the panel</li>
            <li>After closing the banner, use the "Cookie Settings" button in the corner to reopen</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BasicTestingTab;
