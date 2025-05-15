
import React from "react";
import { Button } from "@/components/ui/button";
import { ScriptConfiguration, ScriptCategory } from "@/types/scripts-config.types";

interface ScriptListProps {
  settings: ScriptConfiguration;
  onRemoveScript: (category: ScriptCategory, scriptId: string) => void;
}

export function ScriptList({ settings, onRemoveScript }: ScriptListProps) {
  const categories: ScriptCategory[] = ['analytics', 'advertising', 'functional', 'social'];
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Configured Scripts</h3>
      
      {categories.map(category => (
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
                      <p className="text-xs text-muted-foreground">Inline script: {script.content?.substring(0, 30)}...</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onRemoveScript(category, script.id)}
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
  );
}
