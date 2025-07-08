
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, HelpCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { generateCdnUrl } from '@/lib/utils';

interface AdvancedScriptSectionProps {
  scriptId: string;
}

const AdvancedScriptSection: React.FC<AdvancedScriptSectionProps> = ({ scriptId }) => {
  const [copiedAdvancedScript, setCopiedAdvancedScript] = useState(false);
  const { toast } = useToast();

  const advancedScriptConfig = {
    scripts: {
      analytics: [
        {
          id: "google-analytics-4",
          src: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX",
          async: true
        },
        {
          id: "google-analytics-config",
          content: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX', {cookie_flags: 'SameSite=None;Secure'});"
        }
      ],
      advertising: [
        {
          id: "google-ads",
          src: "https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX",
          async: true
        }
      ],
      functional: [],
      social: [
        {
          id: "facebook-pixel",
          content: "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','YOUR_PIXEL_ID');fbq('track','PageView');"
        }
      ]
    }
  };

  const handleCopyAdvancedScript = () => {
    const advancedScript = `<script 
  src="${generateCdnUrl(scriptId)}" 
  data-config='${JSON.stringify(advancedScriptConfig)}'
  async
></script>`;
    navigator.clipboard.writeText(advancedScript);
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

  const advancedScript = `<script 
  src="${generateCdnUrl(scriptId)}" 
  data-config='${JSON.stringify(advancedScriptConfig)}'
  async
></script>`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-medium">Advanced Implementation (with Real Analytics)</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                <HelpCircleIcon className="h-4 w-4" />
                <span className="sr-only">More information</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>This implementation includes Google Analytics 4, Google Ads, and Facebook Pixel with proper consent management. Scripts will only load after user consent is given for their respective categories.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
        {advancedScript}
      </div>
      <div className="mt-2 space-y-1">
        <p className="text-xs text-muted-foreground">
          <strong>Replace these placeholders:</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          • G-XXXXXXXXXX with your Google Analytics 4 measurement ID
        </p>
        <p className="text-xs text-muted-foreground">
          • AW-XXXXXXXXXX with your Google Ads conversion ID
        </p>
        <p className="text-xs text-muted-foreground">
          • YOUR_PIXEL_ID with your Facebook Pixel ID
        </p>
      </div>

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
  );
};

export default AdvancedScriptSection;
