
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayIcon, EyeIcon, Loader, SettingsIcon, FileTextIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConsentScript, useScripts } from '@/hooks/useScripts';
import { useWebsites } from '@/hooks/useWebsites';
import { generateCdnUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CustomizeDialog } from '@/components/ui/customize-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestScriptPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showPreview, setShowPreview] = useState(false);
  const { websites } = useWebsites();
  const { scripts, loading: scriptsLoading, fetchScripts } = useScripts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [testError, setTestError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [scriptConfiguration, setScriptConfiguration] = useState({
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
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [cookies, setCookies] = useState<string[]>([]);
  
  // Get script data from location state or fetch it if not available
  const [scriptData, setScriptData] = useState<ConsentScript | null>(
    location.state?.scriptData || null
  );
  
  const [websiteName, setWebsiteName] = useState<string>(
    location.state?.websiteName || 'Your Website'
  );

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

  const handleSaveConfiguration = (newConfig) => {
    setScriptConfiguration(newConfig);
    setShowCustomizeDialog(false);
    
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

  const handleBack = () => {
    navigate('/dashboard/scripts');
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
              Preview how your consent banner will appear to visitors and test the enhanced script loading
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                Testing mode is active. No analytics data will be recorded during this preview.
              </AlertDescription>
            </Alert>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Testing</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Testing</TabsTrigger>
                <TabsTrigger value="monitoring">Console & Cookies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
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
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6">
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
                  {`<script 
  src="${generateCdnUrl(scriptData.script_id)}"
  data-config='${JSON.stringify({scripts: scriptConfiguration.scripts}, null, 2)}'
  async
></script>`}
                </div>
              </TabsContent>
              
              <TabsContent value="monitoring" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Console Logs</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-60 overflow-y-auto">
                    {consoleLogs.length > 0 ? (
                      consoleLogs.map((log, index) => (
                        <div key={index} className="mb-1">&gt; {log}</div>
                      ))
                    ) : (
                      <div className="text-gray-500">No logs available. Start the preview to see logs.</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cookies</h3>
                  <div className="bg-gray-50 p-4 rounded-md h-40 overflow-y-auto">
                    {cookies.length > 0 ? (
                      <ul className="space-y-2 font-mono text-sm">
                        {cookies.map((cookie, index) => (
                          <li key={index} className="p-2 bg-white rounded border border-gray-200">
                            {cookie}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No consent cookies found.</p>
                    )}
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
                        Stop Monitoring
                      </>
                    ) : (
                      <>
                        <PlayIcon className="mr-2 h-4 w-4" />
                        Start Monitoring
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <CustomizeDialog 
        open={showCustomizeDialog}
        onOpenChange={setShowCustomizeDialog}
        onSave={handleSaveConfiguration}
        initialSettings={scriptConfiguration}
      />
    </DashboardLayout>
  );
};

export default TestScriptPage;
