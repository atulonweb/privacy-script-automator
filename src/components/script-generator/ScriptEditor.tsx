
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsites, Website } from '@/hooks/useWebsites';
import { ConsentScript, useScripts } from '@/hooks/useScripts';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Import component steps
import AppearanceSettings from './AppearanceSettings';
import BehaviorSettings from './BehaviorSettings';
import ScriptCode from './ScriptCode';

interface ScriptEditorProps {
  scriptData: ConsentScript;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({ scriptData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteId] = useState<string>(scriptData.website_id);
  const [bannerPosition, setBannerPosition] = useState<string>(scriptData.banner_position);
  const [bannerColor, setBannerColor] = useState<string>(scriptData.banner_color);
  const [textColor, setTextColor] = useState<string>(scriptData.text_color);
  const [buttonColor, setButtonColor] = useState<string>(scriptData.button_color);
  const [buttonTextColor, setButtonTextColor] = useState<string>(scriptData.button_text_color);
  const [showPoweredBy, setShowPoweredBy] = useState<boolean>(scriptData.show_powered_by);
  const [autoHide, setAutoHide] = useState<boolean>(scriptData.auto_hide);
  const [autoHideTime, setAutoHideTime] = useState<number>(scriptData.auto_hide_time);
  const [loading, setLoading] = useState(false);
  
  const { websites } = useWebsites();
  const { updateScript } = useScripts();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    setLoading(true);
    
    try {
      console.log("Updating script with data:", {
        id: scriptData.id,
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
      const updatedData = {
        banner_position: bannerPosition,
        banner_color: bannerColor,
        text_color: textColor,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        show_powered_by: showPoweredBy,
        auto_hide: autoHide,
        auto_hide_time: autoHideTime
      };
      
      await updateScript(scriptData.id, updatedData);
      
      // Move to final step
      setCurrentStep(3);
      
      toast({
        title: "Success",
        description: "Script successfully updated!",
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error updating script:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update script. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="step-1" 
              onClick={() => setCurrentStep(1)}
              disabled={loading}
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="step-2" 
              onClick={() => setCurrentStep(2)}
              disabled={loading}
            >
              Behavior
            </TabsTrigger>
            <TabsTrigger 
              value="step-3" 
              onClick={() => {}}
              disabled={currentStep < 3}
            >
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step-1" className="py-4">
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
              onNext={() => setCurrentStep(2)}
              onBack={() => navigate('/dashboard/scripts')}
            />
          </TabsContent>

          <TabsContent value="step-2" className="py-4">
            <BehaviorSettings
              showPoweredBy={showPoweredBy}
              setShowPoweredBy={setShowPoweredBy}
              autoHide={autoHide}
              setAutoHide={setAutoHide}
              autoHideTime={autoHideTime}
              setAutoHideTime={setAutoHideTime}
              loading={loading}
              onSubmit={handleUpdate}
              onBack={() => setCurrentStep(1)}
            />
          </TabsContent>

          <TabsContent value="step-3" className="py-4">
            <ScriptCode
              scriptId={scriptData.script_id}
              website={getSelectedWebsite()}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScriptEditor;
