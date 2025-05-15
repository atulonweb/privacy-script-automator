
import React from "react";
import { Switch } from "@/components/ui/switch";
import { ScriptConfiguration } from "@/types/scripts-config.types";

interface CategorySettingsProps {
  settings: ScriptConfiguration;
  onToggle: (category: string) => void;
}

export function CategorySettings({ settings, onToggle }: CategorySettingsProps) {
  return (
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
          onCheckedChange={() => onToggle('analytics')} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Advertising</h3>
          <p className="text-xs text-muted-foreground">Used for targeted advertising</p>
        </div>
        <Switch 
          checked={settings.advertising} 
          onCheckedChange={() => onToggle('advertising')} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Functional</h3>
          <p className="text-xs text-muted-foreground">Enhance website functionality and personalization</p>
        </div>
        <Switch 
          checked={settings.functional} 
          onCheckedChange={() => onToggle('functional')} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Social Media</h3>
          <p className="text-xs text-muted-foreground">Enable sharing and social media features</p>
        </div>
        <Switch 
          checked={settings.social} 
          onCheckedChange={() => onToggle('social')} 
        />
      </div>
    </div>
  );
}
