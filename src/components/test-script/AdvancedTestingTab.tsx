
import React from 'react';
import { Button } from '@/components/ui/button';
import { SettingsIcon, EyeIcon, PlayIcon } from 'lucide-react';
import { generateCdnUrl } from '@/lib/utils';
import { ConsentScript } from '@/hooks/useScripts';

interface AdvancedTestingTabProps {
  scriptData: ConsentScript | null;
  showPreview: boolean;
  togglePreview: () => void;
  scriptConfiguration: any;
  setShowCustomizeDialog: (show: boolean) => void;
}

const AdvancedTestingTab = ({
  scriptData,
  showPreview,
  togglePreview,
  scriptConfiguration,
  setShowCustomizeDialog
}: AdvancedTestingTabProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-md mb-4">
        <h3 className="font-medium text-sm mb-2">Script Configuration Testing</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Test the enhanced script loading functionality with custom script configurations.
          Scripts will be loaded based on the consent preferences set by the user.
        </p>
        
        <Button 
          onClick={() => setShowCustomizeDialog(true)} 
          className="mb-4"
          variant="outline"
        >
          <SettingsIcon className="mr-2 h-4 w-4" />
          Edit Script Configuration
        </Button>
        
        <div className="text-sm space-y-3">
          <h4 className="font-medium">Current Configuration:</h4>
          <div>
            <span className="font-medium">Analytics:</span> 
            {scriptConfiguration.analytics ? " Enabled" : " Disabled"}
            <span className="text-muted-foreground ml-2">
              ({scriptConfiguration.scripts.analytics.length} scripts)
            </span>
          </div>
          <div>
            <span className="font-medium">Advertising:</span> 
            {scriptConfiguration.advertising ? " Enabled" : " Disabled"}
            <span className="text-muted-foreground ml-2">
              ({scriptConfiguration.scripts.advertising.length} scripts)
            </span>
          </div>
          <div>
            <span className="font-medium">Functional:</span> 
            {scriptConfiguration.functional ? " Enabled" : " Disabled"}
            <span className="text-muted-foreground ml-2">
              ({scriptConfiguration.scripts.functional.length} scripts)
            </span>
          </div>
          <div>
            <span className="font-medium">Social:</span> 
            {scriptConfiguration.social ? " Enabled" : " Disabled"}
            <span className="text-muted-foreground ml-2">
              ({scriptConfiguration.scripts.social.length} scripts)
            </span>
          </div>
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
              Hide Preview
            </>
          ) : (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Test With Configuration
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
        {scriptData && `<script 
  src="${generateCdnUrl(scriptData.script_id)}"
  data-config='${JSON.stringify({scripts: scriptConfiguration.scripts}, null, 2)}'
  async
></script>`}
      </div>
    </div>
  );
};

export default AdvancedTestingTab;
