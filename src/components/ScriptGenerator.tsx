import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { CopyIcon, CheckIcon, Loader } from 'lucide-react';
import { useWebsites, Website } from '@/hooks/useWebsites';
import { useScripts } from '@/hooks/useScripts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const [copiedScript, setCopiedScript] = useState(false);
  const [generatedScriptId, setGeneratedScriptId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { websites, loading: loadingWebsites } = useWebsites();
  const { addScript } = useScripts();

  const generateScriptId = () => {
    return 'cg_' + Math.random().toString(36).substring(2, 15);
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
      
      // Directly call the addScript function with all required data
      const newScript = await addScript({
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
      
      console.log("Script created successfully:", newScript);
      
      if (newScript) {
        setGeneratedScriptId(scriptId);
        setCurrentStep(4); // Move to final step
        toast.success("Script successfully created!");
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

  const handleCopyScript = () => {
    const scriptCode = `<script src="https://cdn.consentguard.com/cg.js?id=${generatedScriptId}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    toast.success("Script code copied to clipboard");
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  const getSelectedWebsite = (): Website | undefined => {
    return websites.find(site => site.id === websiteId);
  };

  const handleBackToDashboard = () => {
    // Use navigate with {replace: true} to avoid history stacking issues
    navigate('/dashboard', { replace: true });
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Select Website</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the website where this consent banner will be used.
                </p>
              </div>

              <div className="space-y-4">
                {loadingWebsites ? (
                  <div className="flex justify-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-brand-600" />
                  </div>
                ) : (
                  <>
                    {websites.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="website-select">Select Website</Label>
                          <Select
                            value={websiteId}
                            onValueChange={setWebsiteId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a website" />
                            </SelectTrigger>
                            <SelectContent>
                              {websites.map((website) => (
                                <SelectItem key={website.id} value={website.id}>
                                  {website.name} ({website.domain})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          You don't have any websites yet. Add a website first.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => navigate('/dashboard', { replace: true })}
                        >
                          Go to Dashboard
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {websiteId && (
                <Button 
                  className="bg-brand-600 hover:bg-brand-700" 
                  onClick={() => setCurrentStep(2)}
                >
                  Next
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="step-2" className="py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Banner Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize how your consent banner will look.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner Position</Label>
                  <RadioGroup 
                    defaultValue="bottom" 
                    value={bannerPosition}
                    onValueChange={setBannerPosition}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottom" id="position-bottom" />
                      <Label htmlFor="position-bottom">Bottom</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="top" id="position-top" />
                      <Label htmlFor="position-top">Top</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottom-left" id="position-bottom-left" />
                      <Label htmlFor="position-bottom-left">Bottom Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottom-right" id="position-bottom-right" />
                      <Label htmlFor="position-bottom-right">Bottom Right</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-color">Banner Color</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="color" 
                      id="banner-color" 
                      value={bannerColor}
                      onChange={(e) => setBannerColor(e.target.value)}
                      className="w-12 h-10 p-1"
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
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="color" 
                      id="text-color" 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button-color">Button Color</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="color" 
                      id="button-color" 
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-12 h-10 p-1"
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
                  <Label htmlFor="button-text-color">Button Text Color</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="color" 
                      id="button-text-color" 
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-12 h-10 p-1"
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

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button 
                  className="bg-brand-600 hover:bg-brand-700" 
                  onClick={() => setCurrentStep(3)}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step-3" className="py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Banner Behavior</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how your consent banner behaves.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="powered-by" className="block">Show "Powered by ConsentGuard"</Label>
                    <p className="text-sm text-muted-foreground">Display our branding on your consent banner.</p>
                  </div>
                  <Switch 
                    id="powered-by" 
                    checked={showPoweredBy}
                    onCheckedChange={setShowPoweredBy}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-hide" className="block">Auto-hide Banner</Label>
                    <p className="text-sm text-muted-foreground">Automatically hide the banner after a time period.</p>
                  </div>
                  <Switch 
                    id="auto-hide" 
                    checked={autoHide}
                    onCheckedChange={setAutoHide}
                  />
                </div>

                {autoHide && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="auto-hide-time">Hide After (seconds): {autoHideTime}</Label>
                    </div>
                    <Slider
                      id="auto-hide-time"
                      min={5}
                      max={60}
                      step={5}
                      defaultValue={[30]}
                      value={[autoHideTime]}
                      onValueChange={(value) => setAutoHideTime(value[0])}
                      className="py-4"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button 
                  className="bg-brand-600 hover:bg-brand-700" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : 'Generate Script'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step-4" className="py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Your Consent Script</h3>
                <p className="text-sm text-muted-foreground">
                  Add this script to your website's &lt;head&gt; tag.
                </p>
              </div>

              <div>
                {websites.find(site => site.id === websiteId) && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-md">
                    <p className="font-medium">{websites.find(site => site.id === websiteId)?.name}</p>
                    <p className="text-sm text-muted-foreground">{websites.find(site => site.id === websiteId)?.domain}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  {`<script src="https://cdn.consentguard.com/cg.js?id=${generatedScriptId}" async></script>`}
                </div>

                <Button 
                  onClick={() => {
                    const scriptCode = `<script src="https://cdn.consentguard.com/cg.js?id=${generatedScriptId}" async></script>`;
                    navigator.clipboard.writeText(scriptCode);
                    setCopiedScript(true);
                    toast.success("Script code copied to clipboard");
                    
                    setTimeout(() => {
                      setCopiedScript(false);
                    }, 3000);
                  }} 
                  variant="outline" 
                  className="mt-4 w-full"
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

              <div className="pt-4">
                <Button 
                  className="bg-brand-600 hover:bg-brand-700" 
                  onClick={() => navigate('/dashboard', { replace: true })}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScriptGenerator;
