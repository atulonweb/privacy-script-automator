
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsites, Website } from '@/hooks/useWebsites';
import { useScripts } from '@/hooks/useScripts';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

// Import component steps
import WebsiteSelection from './script-generator/WebsiteSelection';
import AppearanceSettings from './script-generator/AppearanceSettings';
import BehaviorSettings from './script-generator/BehaviorSettings';
import ScriptCode from './script-generator/ScriptCode';

const ScriptGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteId, setWebsiteId] = useState<string>('');
  const [bannerPosition, setBannerPosition] = useState<string>('bottom');
  const [bannerColor, setBannerColor] = useState<string>('#2563eb');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [buttonColor, setButtonColor] = useState<string>('#ffffff');
  const [buttonTextColor, setButtonTextColor] = useState<string>('#2563eb');
  const [showPoweredBy, setShowPoweredBy] = useState<boolean>(true);
  const [autoHide, setAutoHide] = useState<boolean>(false);
  const [autoHideTime, setAutoHideTime] = useState<number>(30);
  const [generatedScriptId, setGeneratedScriptId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [existingScriptDialogOpen, setExistingScriptDialogOpen] = useState(false);
  
  const { websites, loading: loadingWebsites } = useWebsites();
  const { scripts, addScript } = useScripts();
  const navigate = useNavigate();

  const generateScriptId = () => {
    return 'cg_' + Math.random().toString(36).substring(2, 15);
  };

  // Check if a script already exists for the selected website
  const checkExistingScript = () => {
    if (!websiteId) return false;
    return scripts.some(script => script.website_id === websiteId);
  };

  // Handle website selection with check for existing scripts
  const handleWebsiteSelect = (id: string) => {
    setWebsiteId(id);
    const hasExistingScript = scripts.some(script => script.website_id === id);
    if (hasExistingScript) {
      setExistingScriptDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!websiteId) {
      toast.error("Please select a website first");
      return;
    }
    
    const scriptId = generateScriptId();
    setLoading(true);
    
    try {
      console.log("Creating script with data:", {
        website_id: websiteId,
        script_id: scriptId,
        banner_position: bannerPosition,
        banner_color: bannerColor,
        text_color: textColor,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        show_powered_by: showPoweredBy,
        auto_hide: autoHide,
        auto_hide_time: autoHideTime
      });
      
      // Prepare the data object
      const scriptData = {
        website_id: websiteId,
        script_id: scriptId,
        banner_position: bannerPosition,
        banner_color: bannerColor,
        text_color: textColor,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        show_powered_by: showPoweredBy,
        auto_hide: autoHide,
        auto_hide_time: autoHideTime
      };
      
      // Directly call the addScript function with all required data
      const newScript = await addScript(scriptData);
      
      console.log("Script created successfully:", newScript);
      
      if (newScript) {
        setGeneratedScriptId(scriptId);
        setCurrentStep(4); // Move to final step
        toast.success("Script successfully created! You can find all your scripts in the Scripts page.");
      } else {
        throw new Error("Script could not be created - no data returned");
      }
    } catch (error: any) {
      console.error('Error creating script:', error);
      toast.error(error.message || "Failed to create script. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedWebsite = (): Website | undefined => {
    return websites.find(site => site.id === websiteId);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="step-1" 
              onClick={() => setCurrentStep(1)}
              disabled={loading}
            >
              Website
            </TabsTrigger>
            <TabsTrigger 
              value="step-2" 
              onClick={() => setCurrentStep(2)}
              disabled={!websiteId || loading}
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="step-3" 
              onClick={() => setCurrentStep(3)}
              disabled={!websiteId || loading}
            >
              Behavior
            </TabsTrigger>
            <TabsTrigger 
              value="step-4" 
              onClick={() => {}}
              disabled={!generatedScriptId}
            >
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step-1" className="py-4">
            <WebsiteSelection
              websites={websites}
              loadingWebsites={loadingWebsites}
              websiteId={websiteId}
              setWebsiteId={handleWebsiteSelect}
              onNext={() => setCurrentStep(2)}
            />
          </TabsContent>

          <TabsContent value="step-2" className="py-4">
            <AppearanceSettings
              bannerPosition={bannerPosition}
              setBannerPosition={setBannerPosition}
              bannerColor={bannerColor}
              setBannerColor={setBannerColor}
              textColor={textColor}
              setTextColor={setTextColor}
              buttonColor={buttonColor}
              setButtonColor={setButtonColor}
              buttonTextColor={buttonTextColor}
              setButtonTextColor={setButtonTextColor}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          </TabsContent>

          <TabsContent value="step-3" className="py-4">
            <BehaviorSettings
              showPoweredBy={showPoweredBy}
              setShowPoweredBy={setShowPoweredBy}
              autoHide={autoHide}
              setAutoHide={setAutoHide}
              autoHideTime={autoHideTime}
              setAutoHideTime={setAutoHideTime}
              loading={loading}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
            />
          </TabsContent>

          <TabsContent value="step-4" className="py-4">
            <ScriptCode
              scriptId={generatedScriptId}
              website={getSelectedWebsite()}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Alert Dialog for existing scripts */}
      <AlertDialog open={existingScriptDialogOpen} onOpenChange={setExistingScriptDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Script Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              This website already has one or more consent scripts. Do you want to create another one or view existing scripts?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExistingScriptDialogOpen(false)}>Continue Creating</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/dashboard/scripts')}>View Existing Scripts</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ScriptGenerator;
