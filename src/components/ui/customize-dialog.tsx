
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoIcon, PlusIcon } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { useToast } from "@/hooks/use-toast";
import { ScriptConfiguration, ScriptCategory } from "@/types/scripts-config.types";

// Import refactored components
import { CategorySettings } from "./script-config/CategorySettings";
import { ScriptForm } from "./script-config/ScriptForm";
import { ScriptList } from "./script-config/ScriptList";
import { PresetScriptsLibrary } from "./preset-scripts-library";

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
  
  const handleAddScript = (newScript) => {
    if (!newScript.id) return;
    
    const scriptObj = newScript.src 
      ? { id: newScript.id, src: newScript.src, async: newScript.async, category: newScript.category } 
      : { id: newScript.id, content: newScript.content, category: newScript.category };
      
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
    
    toast({
      title: "Script Added",
      description: `Added ${scriptObj.id} to ${newScript.category} category.`,
      variant: "default"
    });
  };
  
  const handleRemoveScript = (category: ScriptCategory, scriptId: string) => {
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
    // Ensure the script is added to the correct category
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
            <CategorySettings 
              settings={settings} 
              onToggle={handleCategoryToggle} 
            />
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

              <ScriptForm onAddScript={handleAddScript} />
              
              <ScriptList 
                settings={settings} 
                onRemoveScript={handleRemoveScript} 
              />
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
