
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayIcon, EyeIcon } from 'lucide-react';
import { generateCdnUrl } from '@/lib/utils';

interface ScriptPreviewProps {
  scriptId: string;
}

const ScriptPreview: React.FC<ScriptPreviewProps> = ({ scriptId }) => {
  const [showPreview, setShowPreview] = useState(false);

  const togglePreview = () => {
    setShowPreview(!showPreview);
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
      script.src = generateCdnUrl(scriptId) + "&testMode=true"; // Add testMode parameter
      script.id = 'preview-consent-script';
      script.async = true;
      
      document.head.appendChild(script);
    } else {
      cleanupConsentElements();
    }
  }, [showPreview, scriptId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mt-4">
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
        <div className="mt-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
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
        </div>
      )}
    </div>
  );
};

export default ScriptPreview;
