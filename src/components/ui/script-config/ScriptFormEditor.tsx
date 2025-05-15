
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PresetScript, ScriptCategory } from "@/types/scripts-config.types";

interface ScriptFormEditorProps {
  selectedScript: PresetScript | null;
  onGoBack: () => void;
  onSave: (scriptData: {
    id: string;
    src: string;
    async: boolean;
    category: ScriptCategory;
  }) => void;
}

export function ScriptFormEditor({ selectedScript, onGoBack, onSave }: ScriptFormEditorProps) {
  const [scriptData, setScriptData] = useState({
    id: "",
    name: "",
    src: "",
    category: "analytics" as ScriptCategory,
    async: true
  });
  
  useEffect(() => {
    if (selectedScript) {
      setScriptData({
        id: selectedScript.id,
        name: selectedScript.name,
        src: selectedScript.src,
        category: selectedScript.category,
        async: selectedScript.async
      });
    }
  }, [selectedScript]);
  
  const handleSave = () => {
    if (scriptData.id && scriptData.src) {
      onSave({
        id: scriptData.id,
        src: scriptData.src,
        async: scriptData.async,
        category: scriptData.category
      });
    }
  };
  
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={onGoBack} 
          className="px-2"
        >
          ← Back
        </Button>
        <h3 className="text-lg font-semibold ml-2">
          {selectedScript?.name || "Add Script"}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="script-id">Script ID</Label>
          <Input 
            id="script-id" 
            value={scriptData.id}
            onChange={(e) => setScriptData({...scriptData, id: e.target.value})}
            placeholder="unique-script-id"
          />
          <p className="text-xs text-muted-foreground">A unique identifier for this script</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="script-url">Script URL</Label>
          <Input 
            id="script-url" 
            value={scriptData.src}
            onChange={(e) => setScriptData({...scriptData, src: e.target.value})}
            placeholder="https://example.com/script.js"
          />
          <p className="text-xs text-muted-foreground">
            {selectedScript?.name === "Google Analytics 4" ? 
              "Replace G-XXXXXXXXXX with your GA4 tracking ID" : 
              "URL of the script to be loaded"
            }
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="script-category">Category</Label>
          <select
            id="script-category"
            value={scriptData.category}
            onChange={(e) => setScriptData({
              ...scriptData, 
              category: e.target.value as ScriptCategory
            })}
            className="w-full p-2 border rounded-md"
          >
            <option value="analytics">Analytics</option>
            <option value="advertising">Advertising</option>
            <option value="functional">Functional</option>
            <option value="social">Social</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="script-async"
            checked={scriptData.async}
            onCheckedChange={(checked) => 
              setScriptData({...scriptData, async: Boolean(checked)})
            }
          />
          <Label htmlFor="script-async">Load asynchronously</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          onClick={onGoBack}
        >
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Script
        </Button>
      </div>
    </div>
  );
}
