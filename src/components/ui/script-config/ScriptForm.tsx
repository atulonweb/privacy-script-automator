
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScriptCategory } from "@/types/scripts-config.types";

interface ScriptFormProps {
  onAddScript: (scriptData: {
    id: string;
    category: ScriptCategory;
    src?: string;
    content?: string;
    async?: boolean;
  }) => void;
}

export function ScriptForm({ onAddScript }: ScriptFormProps) {
  const [newScript, setNewScript] = useState({
    id: "",
    category: "analytics" as ScriptCategory,
    src: "",
    content: "",
    async: true
  });
  
  const handleAddScript = () => {
    if (!newScript.id || (!newScript.src && !newScript.content)) {
      return;
    }
    
    onAddScript(newScript);
    
    // Reset form
    setNewScript({
      id: "",
      category: "analytics",
      src: "",
      content: "",
      async: true
    });
  };
  
  return (
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
            onChange={e => setNewScript({
              ...newScript, 
              category: e.target.value as ScriptCategory
            })}
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
  );
}
