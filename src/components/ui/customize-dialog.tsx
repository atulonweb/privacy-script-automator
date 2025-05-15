import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { InfoIcon, PlusIcon } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { PresetScriptsLibrary } from "./preset-scripts-library";
import { useToast } from "@/hooks/use-toast";

export function CustomizeDialog({
  open,
  onOpenChange,
  onSave,
  initialSettings = {
    analytics: true,
    advertising: false,
    functional: true,
    social: false,
    scripts: {
      analytics: [],
      advertising: [],
      functional: [],
      social: []
    }
  }
}) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("categories");
  const [newScript, setNewScript] = useState({
    id: "",
    category: "analytics",
    src: "",
    async: true,
    content: ""
  });
  const [presetLibraryOpen, setPresetLibraryOpen] = useState(false);
  
  const handleCategoryToggle = (category) => {
    setSettings({
      ...settings,
      [category]: !settings[category]
    });
  };
  
  const handleSaveSettings = () => {
    onSave(settings);
    toast({
      title: "Settings Saved",
      description: "Your script configuration has been saved successfully.",
      variant: "success"
    });
  };
  
  const handleAddScript = () => {
    if (!newScript.id) return;
    
    const scriptObj = newScript.src 
      ? { id: newScript.id, src: newScript.src, async: newScript.async } 
      : { id: newScript.id, content: newScript.content };
      
    setSettings({
      ...settings,
      scripts: {
        ...settings.scripts,
        [newScript.category]: [
          ...settings.scripts[newScript.category],
          scriptObj
        ]
      }
    });
    
    // Reset form
    setNewScript({
      id: "",
      category: "analytics",
      src: "",
      async: true,
      content: ""
    });

    toast({
      title: "Script Added",
      description: `Added ${scriptObj.id} to ${newScript.category} category.`,
      variant: "default"
    });
  };
  
  const handleRemoveScript = (category, scriptId) => {
    setSettings({
      ...settings,
      scripts: {
        ...settings.scripts,
        [category]: settings.scripts[category].filter(s => s.id !== scriptId)
      }
    });

    toast({
      title: "Script Removed",
      description: `Removed ${scriptId} from ${category} category.`,
      variant: "default"
    });
  };

  const handleAddPresetScript = (script) => {
    // Use the category from the script, not from newScript state
    const category = script.category || "analytics";
    
    setSettings({
      ...settings,
      scripts: {
        ...settings.scripts,
        [category]: [
          ...settings.scripts[category],
          script
        ]
      }
    });

    toast({
      title: "Script Added",
      description: `Added ${script.id} to ${category} category.`,
      variant: "default"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Consent Settings</DialogTitle>
          <DialogDescription>
            Configure your cookie preferences and script settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Cookie Categories</TabsTrigger>
            <TabsTrigger value="scripts">Script Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="pt-4 space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Necessary</h3>
                  <p className="text-xs text-muted-foreground">Required for the website to function properly</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Analytics</h3>
                  <p className="text-xs text-muted-foreground">Help us understand how visitors use our website</p>
                </div>
                <Switch 
                  checked={settings.analytics} 
                  onCheckedChange={() => handleCategoryToggle('analytics')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Advertising</h3>
                  <p className="text-xs text-muted-foreground">Used for targeted advertising</p>
                </div>
                <Switch 
                  checked={settings.advertising} 
                  onCheckedChange={() => handleCategoryToggle('advertising')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Functional</h3>
                  <p className="text-xs text-muted-foreground">Enhance website functionality and personalization</p>
                </div>
                <Switch 
                  checked={settings.functional} 
                  onCheckedChange={() => handleCategoryToggle('functional')} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Social Media</h3>
                  <p className="text-xs text-muted-foreground">Enable sharing and social media features</p>
                </div>
                <Switch 
                  checked={settings.social} 
                  onCheckedChange={() => handleCategoryToggle('social')} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scripts" className="pt-4">
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Configure which scripts will be loaded for each consent category
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Script Configuration</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetLibraryOpen(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Add from Library
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Add New Script</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="script-id">Script ID</Label>
                    <Input 
                      id="script-id" 
                      placeholder="unique-script-id" 
                      value={newScript.id}
                      onChange={e => setNewScript({...newScript, id: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="script-category">Category</Label>
                    <select 
                      id="script-category"
                      className="w-full p-2 border rounded-md"
                      value={newScript.category}
                      onChange={e => setNewScript({...newScript, category: e.target.value})}
                    >
                      <option value="analytics">Analytics</option>
                      <option value="advertising">Advertising</option>
                      <option value="functional">Functional</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="external-script"
                      name="script-type"
                      checked={!!newScript.src}
                      onChange={() => setNewScript({...newScript, src: "https://", content: ""})}
                    />
                    <Label htmlFor="external-script">External Script</Label>
                  </div>
                  
                  {!!newScript.src && (
                    <>
                      <Input 
                        placeholder="https://example.com/script.js" 
                        value={newScript.src}
                        onChange={e => setNewScript({...newScript, src: e.target.value})}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="script-async"
                          checked={newScript.async}
                          onChange={e => setNewScript({...newScript, async: e.target.checked})}
                        />
                        <Label htmlFor="script-async">Load Asynchronously</Label>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="inline-script"
                      name="script-type"
                      checked={!!newScript.content}
                      onChange={() => setNewScript({...newScript, content: "// Your script code here", src: ""})}
                    />
                    <Label htmlFor="inline-script">Inline Script</Label>
                  </div>
                  
                  {!!newScript.content && (
                    <Textarea 
                      placeholder="// JavaScript code here" 
                      className="font-mono"
                      value={newScript.content}
                      onChange={e => setNewScript({...newScript, content: e.target.value})}
                      rows={4}
                    />
                  )}
                </div>
                
                <Button onClick={handleAddScript} disabled={!newScript.id || (!newScript.src && !newScript.content)}>
                  Add Script
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Configured Scripts</h3>
                
                {['analytics', 'advertising', 'functional', 'social'].map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium capitalize">{category}</h4>
                    {settings.scripts[category].length === 0 ? (
                      <p className="text-xs text-muted-foreground">No scripts configured</p>
                    ) : (
                      <ul className="text-xs space-y-2">
                        {settings.scripts[category].map(script => (
                          <li key={script.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                            <div>
                              <span className="font-medium">{script.id}</span>
                              {script.src ? (
                                <p className="text-xs text-muted-foreground">Source: {script.src}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground">Inline script: {script.content.substring(0, 30)}...</p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveScript(category, script.id)}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Preferences
          </Button>
        </div>

        {/* Preset Scripts Library Dialog */}
        <PresetScriptsLibrary 
          open={presetLibraryOpen}
          onOpenChange={setPresetLibraryOpen}
          onAddScript={(script) => {
            handleAddPresetScript(script);
            setPresetLibraryOpen(false);
          }}
          currentScripts={[
            ...settings.scripts.analytics,
            ...settings.scripts.advertising, 
            ...settings.scripts.functional, 
            ...settings.scripts.social
          ]}
        />
      </DialogContent>
    </Dialog>
  );
}
