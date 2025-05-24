import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { PresetScript, ScriptCategory } from '@/types/scripts-config.types';
import ScriptIcon from '@/components/ui/script-icon';
import { ArrowLeftIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';

interface ScriptFormEditorProps {
  selectedScript: PresetScript | null;
  onGoBack: () => void;
  onSave: (script: any) => void;
}

export function ScriptFormEditor({ selectedScript, onGoBack, onSave }: ScriptFormEditorProps) {
  const [formData, setFormData] = useState({
    id: '',
    src: '',
    content: '',
    async: true,
    category: 'analytics' as ScriptCategory,
    attributes: {}
  });

  useEffect(() => {
    if (selectedScript) {
      setFormData({
        id: selectedScript.id,
        src: selectedScript.src || '',
        content: '',
        async: selectedScript.async,
        category: selectedScript.category,
        attributes: {}
      });
    }
  }, [selectedScript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getConfigurationHints = (scriptId: string) => {
    const hints = {
      'google-analytics-4': {
        placeholders: ['REPLACE_WITH_YOUR_GA4_MEASUREMENT_ID'],
        example: 'G-XXXXXXXXXX',
        description: 'Replace with your Google Analytics 4 Measurement ID',
        getLink: 'https://analytics.google.com/'
      },
      'google-universal-analytics': {
        placeholders: ['REPLACE_WITH_YOUR_UA_TRACKING_ID'],
        example: 'UA-XXXXXXXX-X',
        description: 'Replace with your Universal Analytics Tracking ID',
        getLink: 'https://analytics.google.com/'
      },
      'matomo': {
        placeholders: ['YOUR_MATOMO_URL', 'YOUR_SITE_ID'],
        example: 'https://your-domain.matomo.cloud/ and site ID like 1, 2, 3...',
        description: 'Replace with your Matomo URL and Site ID',
        getLink: 'https://matomo.org/'
      },
      'hotjar': {
        placeholders: ['YOUR_HOTJAR_ID'],
        example: '1234567',
        description: 'Replace with your Hotjar Site ID (numeric value)',
        getLink: 'https://www.hotjar.com/'
      },
      'facebook-pixel': {
        placeholders: ['YOUR_PIXEL_ID'],
        example: '1234567890123456',
        description: 'Replace with your Facebook Pixel ID',
        getLink: 'https://business.facebook.com/events_manager'
      }
    };

    return hints[scriptId] || null;
  };

  const hints = selectedScript ? getConfigurationHints(selectedScript.id) : null;
  const hasPlaceholders = hints && hints.placeholders.some(placeholder => 
    formData.src.includes(placeholder)
  );

  if (!selectedScript) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <ScriptIcon scriptId={selectedScript.id} className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Configure {selectedScript.name}</h3>
      </div>

      {hints && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Configuration needed:</strong> {hints.description}</p>
              <p><strong>Example format:</strong> {hints.example}</p>
              <a
                href={hints.getLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline text-sm"
              >
                <ExternalLinkIcon className="h-3 w-3" />
                <span>Get your {selectedScript.name} credentials</span>
              </a>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="script-id">Script ID</Label>
          <Input
            id="script-id"
            value={formData.id}
            onChange={(e) => setFormData({...formData, id: e.target.value})}
            placeholder="unique-script-id"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="script-src">Script Source URL</Label>
          <Textarea
            id="script-src"
            value={formData.src}
            onChange={(e) => setFormData({...formData, src: e.target.value})}
            placeholder="https://example.com/script.js"
            rows={3}
            className="font-mono text-sm"
          />
          {hasPlaceholders && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Placeholder values detected:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {hints.placeholders.map((placeholder, index) => (
                  formData.src.includes(placeholder) && (
                    <li key={index} className="font-mono bg-yellow-100 px-2 py-1 rounded">
                      Replace: <code>{placeholder}</code>
                    </li>
                  )
                ))}
              </ul>
              <p className="text-xs text-yellow-600 mt-2">
                Make sure to replace these with your actual values before saving.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="script-category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value: ScriptCategory) => setFormData({...formData, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="advertising">Advertising</SelectItem>
              <SelectItem value="functional">Functional</SelectItem>
              <SelectItem value="social">Social</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="async-checkbox"
            checked={formData.async}
            onCheckedChange={(checked) => setFormData({...formData, async: !!checked})}
          />
          <Label htmlFor="async-checkbox" className="text-sm">
            Load script asynchronously (recommended)
          </Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onGoBack}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={hasPlaceholders}
          >
            {hasPlaceholders ? 'Replace placeholders first' : 'Add Script'}
          </Button>
        </div>
      </form>
    </div>
  );
}
