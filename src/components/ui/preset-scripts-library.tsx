
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScriptCategory, PresetScript } from '@/types/scripts-config.types';
import { PRESET_SCRIPTS } from '@/data/preset-scripts';
import { PresetScriptCard } from './script-config/PresetScriptCard';
import { ScriptFormEditor } from './script-config/ScriptFormEditor';

// Define the component props
interface PresetScriptsLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScript: (script: any) => void;
  currentScripts: any[];
}

export function PresetScriptsLibrary({
  open,
  onOpenChange,
  onAddScript,
  currentScripts
}: PresetScriptsLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<ScriptCategory>('analytics');
  const [showScriptForm, setShowScriptForm] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<PresetScript | null>(null);

  const handleSelectPreset = (preset: PresetScript) => {
    setSelectedScript(preset);
    setShowScriptForm(true);
  };

  const handleSaveScript = (scriptData) => {
    if (scriptData.id && scriptData.src) {
      onAddScript(scriptData);
      setShowScriptForm(false);
      setSelectedScript(null);
    }
  };

  const isScriptAdded = (scriptId: string) => {
    return currentScripts.some(script => script.id === scriptId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Third-Party Scripts</DialogTitle>
        </DialogHeader>

        {!showScriptForm ? (
          <Tabs defaultValue="analytics" value={activeCategory} onValueChange={(value) => setActiveCategory(value as ScriptCategory)}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="advertising">Advertising</TabsTrigger>
              <TabsTrigger value="functional">Functional</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            {(['analytics', 'advertising', 'functional', 'social'] as ScriptCategory[]).map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {PRESET_SCRIPTS.filter(script => script.category === category).map(script => (
                    <PresetScriptCard
                      key={script.id}
                      script={script}
                      isAdded={isScriptAdded(script.id)}
                      onSelect={handleSelectPreset}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <ScriptFormEditor
            selectedScript={selectedScript}
            onGoBack={() => setShowScriptForm(false)}
            onSave={handleSaveScript}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
