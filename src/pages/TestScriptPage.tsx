import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayIcon, EyeIcon, Loader } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConsentScript, useScripts } from '@/hooks/useScripts';
import { useWebsites } from '@/hooks/useWebsites';
import { generateCdnUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CustomizeDialog } from '@/components/ui/customize-dialog';

const TestScriptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const { websites } = useWebsites();
  const { scripts, loading: scriptsLoading, fetchScripts } = useScripts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Get script data from location state or fetch it if not available
  const [scriptData, setScriptData] = useState<ConsentScript | null>(
    location.state?.scriptData || null
  );
  
  const [websiteName, setWebsiteName] = useState<string>(
    location.state?.websiteName || 'Your Website'
  );

  useEffect(() => {
    // If script data wasn't passed via location state, fetch it using the id
    if (!scriptData && id) {
      const loadScript = async () => {
        setLoading(true);
        await fetchScripts();
        setLoading(false);
      };
      
      loadScript();
    } else {
      setLoading(false);
    }
  }, [id, scriptData, fetchScripts]);
  
  // Find the script after fetching if we didn't have it from location state
  useEffect(() => {
    if (!scriptData && id && scripts.length > 0) {
      const foundScript = scripts.find(script => script.id === id);
      if (foundScript) {
        setScriptData(foundScript);
        
        // Also find the website name
        const website = websites.find(w => w.id === foundScript.website_id);
        if (website) {
          setWebsiteName(website.name);
        }
      } else {
        toast({
          title: "Error",
          description: "Script not found",
          variant: "destructive",
        });
      }
    }
  }, [id, scripts, websites, scriptData, toast]);

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

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle the preview logic
  useEffect(() => {
    if (showPreview && scriptData) {
      // Make sure to clean up any existing elements first
      cleanupConsentElements();

      // Create and inject the script
      const script = document.createElement('script');
      script.id = 'preview-consent-script';
      
      // Modify the URL to include a test parameter to prevent analytics tracking
      script.src = `${generateCdnUrl(scriptData.script_id)}&testMode=true`;
      script.async = true;
      
      document.head.appendChild(script);
    } else {
      cleanupConsentElements();
    }
  }, [showPreview, scriptData]);

  const handleBack = () => {
    navigate('/dashboard/scripts');
  };

  const handleSavePreferences = (preferences: Record<string, boolean>) => {
    console.log('Saved preferences:', preferences);
    toast.success({
      title: "Success", 
      description: "Cookie preferences saved successfully"
    });
  };

  if (loading || scriptsLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <Loader className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading script data...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!scriptData) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Script not found. Please select a script to test from the scripts list.</p>
              <Button onClick={handleBack} className="bg-brand-600 hover:bg-brand-700">
                Back to Scripts
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testing "{websiteName}" Consent Script</CardTitle>
            <CardDescription>
              Preview how your consent banner will appear to visitors without affecting analytics
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                Testing mode is active. No analytics data will be recorded during this preview.
              </AlertDescription>
            </Alert>
            
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
            
            {showPreview && (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    Preview Active
                  </p>
                  <p className="text-sm text-green-700">
                    A consent banner should appear at the bottom of this page. Features:
                  </p>
                  <ul className="list-disc list-inside text-sm text-green-700 mt-2">
                    <li>Click "Customize" to open the settings panel with cookie categories</li>
                    <li>Toggle cookie categories on/off in the customize panel</li>
                    <li>Use "Save Preferences", "Accept All", or "Reject All" buttons</li>
                    <li>After closing the banner, use the "Cookie Settings" button in the corner to reopen</li>
                  </ul>
                </div>
                
                <div className="mt-3 border rounded-md p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Try our new detailed customization dialog:</h4>
                  <CustomizeDialog onSavePreferences={handleSavePreferences} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TestScriptPage;
