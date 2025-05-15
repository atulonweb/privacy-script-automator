
import { useState, useEffect } from 'react';
import { ConsentScript } from '@/hooks/useScripts';
import { generateCdnUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ScriptConfiguration {
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
  social: boolean;
  scripts: {
    analytics: any[];
    advertising: any[];
    functional: any[];
    social: any[];
  }
}

interface UseScriptTestingProps {
  scriptData: ConsentScript | null;
}

export const useScriptTesting = ({ scriptData }: UseScriptTestingProps) => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [cookies, setCookies] = useState<string[]>([]);
  const [scriptConfiguration, setScriptConfiguration] = useState<ScriptConfiguration>({
    analytics: true,
    advertising: false,
    functional: true,
    social: false,
    scripts: {
      analytics: [
        { id: 'ga-test', src: 'https://www.googletagmanager.com/gtag/js?id=DEMO-ID', async: true }
      ],
      advertising: [
        { id: 'fb-test', src: 'https://connect.facebook.net/en_US/fbevents.js', async: true }
      ],
      functional: [],
      social: []
    }
  });

  // Override console.log to capture messages
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      // Only capture ConsentGuard related logs
      if (args[0] && typeof args[0] === 'string' && args[0].includes('ConsentGuard')) {
        setConsoleLogs(prev => [...prev, args.join(' ')]);
      }
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Check for cookies periodically
  useEffect(() => {
    if (showPreview) {
      const intervalId = setInterval(() => {
        const allCookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .filter(cookie => cookie.includes('consentguard'));
        setCookies(allCookies);
      }, 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [showPreview]);

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

    // Clear any previous errors and logs
    setTestError(null);
    setConsoleLogs([]);
    setCookies([]);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle the preview logic
  useEffect(() => {
    if (showPreview && scriptData) {
      // Make sure to clean up any existing elements first
      cleanupConsentElements();

      try {
        // Create and inject the script
        const script = document.createElement('script');
        script.id = 'preview-consent-script';
        
        // Modify the URL to include a test parameter to prevent analytics tracking
        script.src = `${generateCdnUrl(scriptData.script_id)}&testMode=true`;
        script.async = true;
        
        // Add data attributes to inject the script configuration
        script.setAttribute('data-config', JSON.stringify({
          scripts: scriptConfiguration.scripts
        }));
        
        // Add error handling to the script
        script.onerror = (e) => {
          console.error("Failed to load consent script:", e);
          setTestError("Failed to load the consent script. Please make sure the script is properly configured.");
          toast({
            title: "Error",
            description: "Failed to load consent script. Please try refreshing the page.",
            variant: "destructive"
          });
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error("Error in preview:", error);
        setTestError("Failed to initialize the preview. Please try again.");
      }
    } else {
      cleanupConsentElements();
    }
  }, [showPreview, scriptData, toast, scriptConfiguration]);

  const handleSaveConfiguration = (newConfig: ScriptConfiguration) => {
    setScriptConfiguration(newConfig);
    
    // If preview is active, restart it with the new config
    if (showPreview) {
      setShowPreview(false);
      setTimeout(() => setShowPreview(true), 100);
    }
    
    toast({
      title: "Configuration Saved",
      description: "The script configuration has been updated and will be used when testing."
    });
  };

  return {
    showPreview,
    togglePreview,
    testError,
    consoleLogs,
    cookies,
    scriptConfiguration,
    handleSaveConfiguration,
    cleanupConsentElements
  };
};
