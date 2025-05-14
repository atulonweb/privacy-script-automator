
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon, PlayIcon, EyeIcon, ListIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Website } from '@/hooks/useWebsites';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';
import { generateCdnUrl } from '@/lib/utils';

interface ScriptCodeProps {
  scriptId: string;
  website: Website | undefined;
}

const ScriptCode: React.FC<ScriptCodeProps> = ({ scriptId, website }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
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

  const togglePreview = () => {
    setShowPreview(!showPreview);
    
    if (!showPreview) {
      toast({
        title: "Loading Preview",
        description: "Loading preview banner from CDN...",
        duration: 2000,
      });
    }
  };

  // Clean up the preview when component unmounts
  useEffect(() => {
    return () => {
      cleanupConsentElements();
    };
  }, []);

  // Function to clean up all consent-related elements
  const cleanupConsentElements = () => {
    // Remove any banner that might have been created
    const existingBanner = document.getElementById('consentguard-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    // Remove any customize panel that might have been created
    const customizePanel = document.getElementById('consentguard-customize-panel');
    if (customizePanel) {
      customizePanel.remove();
    }
    
    // Remove settings button if it exists
    const settingsButton = document.getElementById('consentguard-settings-button');
    if (settingsButton) {
      settingsButton.remove();
    }
    
    // Remove any script tag that might have been added
    const existingScript = document.getElementById('preview-consent-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Remove any consent cookies to ensure the banner appears again
    document.cookie = "consentguard_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "consentguard_preferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  // Handle the preview logic
  useEffect(() => {
    if (showPreview) {
      // Make sure to clean up any existing elements first
      cleanupConsentElements();

      // Create and inject the script
      const script = document.createElement('script');
      script.src = generateCdnUrl(scriptId);
      script.id = 'preview-consent-script';
      script.async = true;
      
      // Add event listeners for success/failure
      script.onload = () => {
        toast({
          title: "Success",
          description: "Preview script loaded successfully!",
          duration: 2000,
        });
      };
      
      script.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load script. Please check your setup.",
          variant: "destructive",
          duration: 3000,
        });
        setShowPreview(false);
      };
      
      document.head.appendChild(script);
    } else {
      cleanupConsentElements();
    }
  }, [showPreview, scriptId, toast]);

  return (
    <div className="space-y-6">
      <Alert className="bg-green-50 border-green-200 mb-4">
        <CheckIcon className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Success!</AlertTitle>
        <AlertDescription className="text-green-700">
          Your script has been successfully created and is ready to use. You can always find all your scripts in the Scripts page.
        </AlertDescription>
      </Alert>
      
      <div>
        <h3 className="text-lg font-medium">Your Consent Script</h3>
        <p className="text-sm text-muted-foreground">
          Add this script to your website's &lt;head&gt; tag.
        </p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Implementation Information</AlertTitle>
        <AlertDescription>
          The script URL references a consent management script. Add this script to your website to display 
          the consent banner based on the settings you've configured.
        </AlertDescription>
      </Alert>

      <div>
        {website && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p className="font-medium">{website.name}</p>
            <p className="text-sm text-muted-foreground">{website.domain}</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
          {`<script src="${generateCdnUrl(scriptId)}" async></script>`}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={handleCopyScript} 
            variant="outline" 
            className="flex-1"
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
        
        {showPreview && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              A consent banner should appear at the bottom of this page. You can click the "Customize" button to open 
              the settings panel with cookie categories you can enable/disable. The panel includes options to save preferences, 
              accept all, or reject all cookies.
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-2">
        <Button 
          className="bg-brand-600 hover:bg-brand-700" 
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Back to Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/scripts')}
          className="flex-1"
        >
          <ListIcon className="mr-2 h-4 w-4" />
          View All Scripts
        </Button>
      </div>
    </div>
  );
};

export default ScriptCode;
