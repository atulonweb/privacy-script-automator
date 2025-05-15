
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
  data-user-id="YOUR_USER_ID"
  data-session-id="YOUR_SESSION_ID"
  async
></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    toast({
      title: "Success",
      description: "Advanced script code copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedScript(false);
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
                <p>Even this basic implementation handles all consent management functionality. The script automatically loads your configuration from our servers using the script ID.</p>
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
          <h4 className="font-medium">Advanced Implementation (with Data Attributes)</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                  <HelpCircleIcon className="h-4 w-4" />
                  <span className="sr-only">More information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This implementation adds user tracking capabilities to the basic script. The data attributes allow you to associate consent choices with specific users or sessions in your analytics and webhooks.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
          {`<script 
  src="${generateCdnUrl(scriptId)}" 
  data-user-id="YOUR_USER_ID"
  data-session-id="YOUR_SESSION_ID"
  async
></script>`}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Using data attributes allows you to track consent preferences for specific users or sessions.
          These values will be included in analytics and webhook payloads.
        </p>

        <Button 
          onClick={handleCopyAdvancedScript} 
          variant="outline" 
          className="mt-2"
        >
          <CopyIcon className="mr-2 h-4 w-4" />
          Copy Advanced Script
        </Button>
      </div>
    </div>
  );
};

export default ScriptImplementation;
