
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, HelpCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateCdnUrl } from '@/lib/utils';

interface BasicScriptSectionProps {
  scriptId: string;
}

const BasicScriptSection: React.FC<BasicScriptSectionProps> = ({ scriptId }) => {
  const [copiedBasicScript, setCopiedBasicScript] = useState(false);
  const { toast } = useToast();

  const handleCopyBasicScript = () => {
    const basicScript = `<script 
  src="${generateCdnUrl(scriptId)}" 
  async
></script>`;
    navigator.clipboard.writeText(basicScript);
    setCopiedBasicScript(true);
    toast({
      title: "Success",
      description: "Basic script code copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopiedBasicScript(false);
    }, 3000);
  };

  const basicScript = `<script 
  src="${generateCdnUrl(scriptId)}" 
  async
></script>`;

  return (
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
              <p>This basic implementation provides pure consent management - it shows the consent banner and blocks external tracking scripts until user consent is given. It does NOT include any tracking scripts by default. Use the Advanced implementation if you want to load your own tracking scripts after consent.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
        {basicScript}
      </div>

      <Button 
        onClick={handleCopyBasicScript} 
        variant="outline" 
        className="mt-2"
      >
        {copiedBasicScript ? (
          <>
            <CheckIcon className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <CopyIcon className="mr-2 h-4 w-4" />
            Copy Basic Script
          </>
        )}
      </Button>
    </div>
  );
};

export default BasicScriptSection;
