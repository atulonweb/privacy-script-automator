
import React from "react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PresetScript } from "@/types/scripts-config.types";
import { DEFAULT_ICON } from "@/data/preset-scripts";

interface PresetScriptCardProps {
  script: PresetScript;
  isAdded: boolean;
  onSelect: (script: PresetScript) => void;
}

export function PresetScriptCard({ script, isAdded, onSelect }: PresetScriptCardProps) {
  return (
    <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
      <div className="w-8 h-8 mr-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
        <AspectRatio ratio={1/1}>
          <img 
            src={script.icon || DEFAULT_ICON}
            alt={`${script.name} icon`}
            className="object-contain"
            onError={(e) => {
              // Replace broken image with default icon
              (e.target as HTMLImageElement).src = DEFAULT_ICON;
            }}
          />
        </AspectRatio>
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-medium">{script.name}</h4>
        {script.description && (
          <p className="text-xs text-muted-foreground">{script.description}</p>
        )}
      </div>
      <Button 
        onClick={() => onSelect(script)}
        variant={isAdded ? "secondary" : "outline"}
        size="sm"
        disabled={isAdded}
      >
        {isAdded ? "Added" : "Add"}
      </Button>
    </div>
  );
}
