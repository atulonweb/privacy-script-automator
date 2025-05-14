import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import component steps
import WebsiteSelection from './script-generator/WebsiteSelection';
import AppearanceSettings from './script-generator/AppearanceSettings';
import BehaviorSettings from './script-generator/BehaviorSettings';
import ScriptCode from './script-generator/ScriptCode';
import ExistingScriptDialog from './script-generator/ExistingScriptDialog';
import { useScriptGenerator } from '@/hooks/useScriptGenerator';

const ScriptGenerator: React.FC = () => {
  const scriptState = useScriptGenerator();
  const {
    currentStep,
    setCurrentStep,
    websiteId,
    setWebsiteId,
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
  } = scriptState;

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
              setWebsiteId={setWebsiteId}
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

      {/* Existing script dialog */}
      <ExistingScriptDialog 
        open={existingScriptDialogOpen} 
        onOpenChange={setExistingScriptDialogOpen} 
      />
    </Card>
  );
};

export default ScriptGenerator;
