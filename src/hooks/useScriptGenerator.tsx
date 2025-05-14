
import { useState } from 'react';
import { useWebsites, Website } from '@/hooks/useWebsites';
import { useScripts } from '@/hooks/useScripts';
import { useToast } from '@/hooks/use-toast';

export const useScriptGenerator = () => {
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
  const { toast } = useToast();

  const generateScriptId = () => {
    return 'cg_' + Math.random().toString(36).substring(2, 15);
  };

  const checkExistingScript = () => {
    if (!websiteId) return false;
    return scripts.some(script => script.website_id === websiteId);
  };

  const handleWebsiteSelect = (id: string) => {
    setWebsiteId(id);
    const hasExistingScript = scripts.some(script => script.website_id === id);
    if (hasExistingScript) {
      setExistingScriptDialogOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!websiteId) {
      toast({
        title: "Error",
        description: "Please select a website first",
        variant: "destructive",
      });
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
        toast.success({
          title: "Success",
          description: "Script successfully created! You can find all your scripts in the Scripts page."
        });
      } else {
        throw new Error("Script could not be created - no data returned");
      }
    } catch (error: any) {
      console.error('Error creating script:', error);
      toast.error({
        title: "Error",
        description: error.message || "Failed to create script. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedWebsite = (): Website | undefined => {
    return websites.find(site => site.id === websiteId);
  };

  return {
    currentStep,
    setCurrentStep,
    websiteId,
    setWebsiteId: handleWebsiteSelect,
    bannerPosition,
    setBannerPosition,
    bannerColor,
    setBannerColor,
    textColor,
    setTextColor,
    buttonColor,
    setButtonColor,
    buttonTextColor,
    setButtonTextColor,
    showPoweredBy,
    setShowPoweredBy,
    autoHide,
    setAutoHide,
    autoHideTime,
    setAutoHideTime,
    generatedScriptId,
    loading,
    websites,
    loadingWebsites,
    handleSubmit,
    getSelectedWebsite,
    existingScriptDialogOpen,
    setExistingScriptDialogOpen
  };
};

export type ScriptGeneratorState = ReturnType<typeof useScriptGenerator>;
