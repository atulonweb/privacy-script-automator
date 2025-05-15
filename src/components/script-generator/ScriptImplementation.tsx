
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, HelpCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCdnUrl } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Website } from '@/hooks/useWebsites';

interface ScriptImplementationProps {
  scriptId: string;
  website: Website | undefined;
}

const ScriptImplementation: React.FC<ScriptImplementationProps> = ({ scriptId, website }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedAdvancedScript, setCopiedAdvancedScript] = useState(false);
  const { toast } = useToast();

  const handleCopyScript = () => {
    const scriptCode = `<script src="${generateCdnUrl(scriptId)}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    toast({
      title: "Success",
      description: "Script code copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  const handleCopyAdvancedScript = () => {
    const scriptCode = `<script 
  src="${generateCdnUrl(scriptId)}" 
  data-config='{"scripts": {"analytics": [{"id": "google-analytics", "src": "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX", "async": true}]}}'
  data-user-id="YOUR_USER_ID"
  data-session-id="YOUR_SESSION_ID"
  async
></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedAdvancedScript(true);
    toast({
      title: "Success",
      description: "Advanced script code copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedAdvancedScript(false);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      {website && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <p className="font-medium">{website.name}</p>
          <p className="text-sm text-muted-foreground">{website.domain}</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium">Basic Implementation</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span className="sr-only">More information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This basic implementation handles all consent management functionality. The script automatically loads your configuration from our servers using the script ID.</p>
                <p className="mt-1 font-semibold">Note: Any scripts with placeholder IDs (like GA_MEASUREMENT_ID) will not be loaded until properly configured.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
          {`<script src="${generateCdnUrl(scriptId)}" async></script>`}
        </div>

        <Button 
          onClick={handleCopyScript} 
          variant="outline" 
          className="mt-2"
        >
          {copiedScript ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy Script
            </>
          )}
        </Button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium">Advanced Implementation (with Inline Config)</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span className="sr-only">More information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This implementation adds user tracking capabilities and inline script configuration. The data-config attribute allows you to define scripts directly in your HTML, overriding the default placeholders.</p>
                <p className="mt-1">Replace G-XXXXXXXXXX with your actual Google Analytics ID.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
          {`<script 
  src="${generateCdnUrl(scriptId)}" 
  data-config='{"scripts": {"analytics": [{"id": "google-analytics", "src": "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX", "async": true}]}}'
  data-user-id="YOUR_USER_ID"
  data-session-id="YOUR_SESSION_ID"
  async
></script>`}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Using data-config allows you to provide actual script URLs and IDs directly in your HTML.
          The data-user-id and data-session-id values will be included in analytics and webhook payloads.
        </p>

        <Button 
          onClick={handleCopyAdvancedScript} 
          variant="outline" 
          className="mt-2"
        >
          {copiedAdvancedScript ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="mr-2 h-4 w-4" />
              Copy Advanced Script
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScriptImplementation;
