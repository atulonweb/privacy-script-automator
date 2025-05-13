
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';

const ScriptWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [websiteName, setWebsiteName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bannerPosition, setBannerPosition] = useState('bottom');
  const [bannerColor, setBannerColor] = useState('#2563eb');
  const [textColor, setTextColor] = useState('#ffffff');
  const [buttonColor, setButtonColor] = useState('#ffffff');
  const [buttonTextColor, setButtonTextColor] = useState('#2563eb');
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [autoHide, setAutoHide] = useState(false);
  const [autoHideTime, setAutoHideTime] = useState([30]);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  
  const steps = [
    { title: "Basic Info", description: "Enter website details" },
    { title: "Appearance", description: "Customize banner look" },
    { title: "Behavior", description: "Set banner behavior" },
    { title: "Generate", description: "Get your script" }
  ];

  const handleNext = () => {
    if (currentStep === 0 && (!websiteName || !websiteUrl)) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    
    if (currentStep === steps.length - 2) {
      setScriptGenerated(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const generatedScript = `<script 
  src="https://cdn.consentguard.com/cg.js?id=CG-${Math.random().toString(36).substring(2, 10)}" 
  data-position="${bannerPosition}" 
  data-banner-color="${bannerColor}" 
  data-text-color="${textColor}"
  data-button-color="${buttonColor}"
  data-button-text-color="${buttonTextColor}"
  data-auto-hide="${autoHide}"
  data-auto-hide-time="${autoHideTime}"
  async></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopiedScript(true);
    toast.success('Script copied to clipboard!');
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Create New Consent Script</CardTitle>
        <CardDescription>
          Follow the steps to generate a consent management script for your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= index ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {index + 1}
              </div>
              <p className={`text-xs mt-1 ${currentStep >= index ? 'text-brand-600 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>
        
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="websiteName">Website Name</Label>
              <Input 
                id="websiteName" 
                value={websiteName} 
                onChange={(e) => setWebsiteName(e.target.value)} 
                placeholder="My Website"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input 
                id="websiteUrl" 
                value={websiteUrl} 
                onChange={(e) => setWebsiteUrl(e.target.value)} 
                placeholder="https://example.com"
                required
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Appearance */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Banner Position</Label>
              <RadioGroup 
                value={bannerPosition} 
                onValueChange={setBannerPosition}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="bottom" id="bottom" className="peer sr-only" />
                  <Label 
                    htmlFor="bottom" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="mb-2 h-10 w-full rounded-md bg-gray-100 flex items-end justify-center">
                      <div className="h-6 w-full bg-brand-600 flex items-center justify-center text-xs text-white">
                        Banner
                      </div>
                    </div>
                    <span>Bottom</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem value="top" id="top" className="peer sr-only" />
                  <Label 
                    htmlFor="top" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="mb-2 h-10 w-full rounded-md bg-gray-100 flex items-start justify-center">
                      <div className="h-6 w-full bg-brand-600 flex items-center justify-center text-xs text-white">
                        Banner
                      </div>
                    </div>
                    <span>Top</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bannerColor">Banner Color</Label>
                <div className="flex">
                  <Input 
                    id="bannerColor" 
                    type="color" 
                    value={bannerColor} 
                    onChange={(e) => setBannerColor(e.target.value)} 
                    className="w-12 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text" 
                    value={bannerColor} 
                    onChange={(e) => setBannerColor(e.target.value)} 
                    className="flex-1" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex">
                  <Input 
                    id="textColor" 
                    type="color" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)} 
                    className="w-12 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text" 
                    value={textColor} 
                    onChange={(e) => setTextColor(e.target.value)} 
                    className="flex-1" 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buttonColor">Button Color</Label>
                <div className="flex">
                  <Input 
                    id="buttonColor" 
                    type="color" 
                    value={buttonColor} 
                    onChange={(e) => setButtonColor(e.target.value)} 
                    className="w-12 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text" 
                    value={buttonColor} 
                    onChange={(e) => setButtonColor(e.target.value)} 
                    className="flex-1" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonTextColor">Button Text Color</Label>
                <div className="flex">
                  <Input 
                    id="buttonTextColor" 
                    type="color" 
                    value={buttonTextColor} 
                    onChange={(e) => setButtonTextColor(e.target.value)} 
                    className="w-12 h-10 p-1 mr-2"
                  />
                  <Input 
                    type="text" 
                    value={buttonTextColor} 
                    onChange={(e) => setButtonTextColor(e.target.value)} 
                    className="flex-1" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="showPoweredBy" 
                checked={showPoweredBy}
                onCheckedChange={setShowPoweredBy}
              />
              <Label htmlFor="showPoweredBy">Show "Powered by ConsentGuard"</Label>
            </div>
          </div>
        )}
        
        {/* Step 3: Behavior */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoHide" 
                checked={autoHide}
                onCheckedChange={setAutoHide}
              />
              <Label htmlFor="autoHide">Automatically hide banner after inactivity</Label>
            </div>
            
            {autoHide && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Auto-hide after (seconds)</Label>
                  <span>{autoHideTime[0]}</span>
                </div>
                <Slider
                  value={autoHideTime}
                  onValueChange={setAutoHideTime}
                  min={5}
                  max={60}
                  step={1}
                />
              </div>
            )}
            
            <Tabs defaultValue="preview">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="p-4">
                <div className="mt-4 rounded-md border overflow-hidden">
                  <div className="h-48 bg-gray-100 relative">
                    <div 
                      style={{ 
                        backgroundColor: bannerPosition === 'bottom' ? bannerColor : 'transparent',
                      }} 
                      className={`
                        absolute left-0 right-0 
                        ${bannerPosition === 'bottom' ? 'bottom-0' : 'top-0'}
                        p-4 flex flex-col md:flex-row md:items-center md:justify-between
                      `}
                    >
                      {bannerPosition === 'top' && (
                        <div 
                          style={{ backgroundColor: bannerColor, color: textColor }}
                          className="absolute inset-0 p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <p className="mb-4 md:mb-0">This website uses cookies to ensure you get the best experience.</p>
                            <div className="flex justify-end gap-2">
                              <button 
                                style={{
                                  backgroundColor: buttonColor,
                                  color: buttonTextColor,
                                }} 
                                className="px-4 py-2 rounded-md text-sm font-medium"
                              >
                                Accept
                              </button>
                              <button 
                                className="px-4 py-2 text-sm"
                                style={{ color: textColor }}
                              >
                                Settings
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {bannerPosition === 'bottom' && (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                          <p className="mb-4 md:mb-0" style={{ color: textColor }}>This website uses cookies to ensure you get the best experience.</p>
                          <div className="flex justify-end gap-2">
                            <button 
                              style={{
                                backgroundColor: buttonColor,
                                color: buttonTextColor,
                              }} 
                              className="px-4 py-2 rounded-md text-sm font-medium"
                            >
                              Accept
                            </button>
                            <button 
                              className="px-4 py-2 text-sm"
                              style={{ color: textColor }}
                            >
                              Settings
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="settings" className="p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Advanced settings will be available in a future update.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* Step 4: Generate */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Your Consent Script</h3>
              <div className="bg-gray-50 p-4 border rounded-md font-mono text-sm overflow-x-auto">
                {generatedScript}
              </div>
              
              <Button 
                onClick={handleCopyScript} 
                variant="outline" 
                className="mt-6 w-full"
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
            </div>
            
            <div className="bg-brand-50 p-4 rounded-md border border-brand-100">
              <h4 className="text-brand-700 font-medium mb-2">Installation Instructions</h4>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-brand-700">
                <li>Copy the script above</li>
                <li>Paste it into the <code className="bg-brand-100 px-1 rounded">&lt;head&gt;</code> section of your website</li>
                <li>Save your changes</li>
                <li>Visit your website to see the consent banner in action</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={currentStep === 0}
        >
          Back
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Continue
          </Button>
        ) : (
          <Button onClick={() => toast.success('Script generated successfully!')}>
            Finish
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScriptWizard;
