
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Define the script type
interface PresetScript {
  name: string;
  id: string;
  src: string;
  category: 'analytics' | 'advertising' | 'functional' | 'social';
  async: boolean;
  icon?: string;
  description?: string;
}

// Define the component props
interface PresetScriptsLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScript: (script: any) => void;
  currentScripts: any[];
}

// Preset library data
const PRESET_SCRIPTS: PresetScript[] = [
  // Analytics scripts
  {
    name: 'Google Analytics 4',
    id: 'ga4',
    src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Google Analytics 4 property for website tracking and analysis'
  },
  {
    name: 'Google Universal Analytics',
    id: 'ga-universal',
    src: 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXXXX',
    category: 'analytics',
    async: true,
    icon: '/google-analytics-icon.png',
    description: 'Legacy Universal Analytics tracking'
  },
  {
    name: 'Matomo (Piwik)',
    id: 'matomo',
    src: 'https://your-matomo-url.com/matomo.js',
    category: 'analytics',
    async: true,
    description: 'Open source website analytics platform'
  },
  {
    name: 'Hotjar',
    id: 'hotjar',
    src: 'https://static.hotjar.com/c/hotjar-XXXX.js',
    category: 'analytics',
    async: true,
    description: 'Behavior analytics and user feedback data'
  },

  // Advertising scripts
  {
    name: 'Facebook Pixel',
    id: 'facebook-pixel',
    src: 'https://connect.facebook.net/en_US/fbevents.js',
    category: 'advertising',
    async: true,
    icon: '/facebook-icon.png',
    description: 'Track conversions from Facebook ads and build audiences'
  },
  {
    name: 'LinkedIn Insight Tag',
    id: 'linkedin-insight',
    src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    category: 'advertising',
    async: true,
    description: 'LinkedIn conversion tracking and retargeting'
  },
  {
    name: 'Google Ads Conversion',
    id: 'google-ads',
    src: 'https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX',
    category: 'advertising',
    async: true,
    description: 'Track ad conversions and remarketing for Google Ads'
  },
  {
    name: 'Twitter Pixel',
    id: 'twitter-pixel',
    src: 'https://static.ads-twitter.com/uwt.js',
    category: 'advertising',
    async: true,
    description: 'Track website activity for Twitter ad campaigns'
  },

  // Functional scripts
  {
    name: 'Zendesk Chat',
    id: 'zendesk-chat',
    src: 'https://static.zdassets.com/ekr/snippet.js?key=XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Live chat widget for customer support'
  },
  {
    name: 'Intercom',
    id: 'intercom',
    src: 'https://widget.intercom.io/widget/XXXXXXXXXX',
    category: 'functional',
    async: true,
    description: 'Customer messaging platform'
  },
  {
    name: 'Crisp Chat',
    id: 'crisp',
    src: 'https://client.crisp.chat/l.js',
    category: 'functional',
    async: true,
    description: 'Live chat and customer messaging widget'
  },
  {
    name: 'Google reCAPTCHA',
    id: 'recaptcha',
    src: 'https://www.google.com/recaptcha/api.js',
    category: 'functional',
    async: true,
    description: 'Bot protection for website forms'
  },

  // Social scripts
  {
    name: 'Instagram Embed',
    id: 'instagram-embed',
    src: 'https://www.instagram.com/embed.js',
    category: 'social',
    async: true,
    description: 'Embed Instagram posts on your website'
  },
  {
    name: 'Twitter Widgets',
    id: 'twitter-widgets',
    src: 'https://platform.twitter.com/widgets.js',
    category: 'social',
    async: true,
    description: 'Embed Twitter content on your website'
  },
  {
    name: 'Facebook SDK',
    id: 'facebook-sdk',
    src: 'https://connect.facebook.net/en_US/sdk.js',
    category: 'social',
    async: true,
    description: 'Enable Facebook sharing and social features'
  },
  {
    name: 'LinkedIn Platform',
    id: 'linkedin-platform',
    src: 'https://platform.linkedin.com/in.js',
    category: 'social',
    async: true,
    description: 'LinkedIn sharing and integration features'
  }
];

const DEFAULT_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 3H5a2 2 0 0 0-2 2v4'%3E%3C/path%3E%3Cpath d='M9 21H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpath d='M19 3h4a2 2 0 0 1 2 2v4'%3E%3C/path%3E%3Cpath d='M19 21h4a2 2 0 0 0 2-2v-4'%3E%3C/path%3E%3Cpath d='M10 4 8 6l2 2'%3E%3C/path%3E%3Cpath d='m14 4 2 2-2 2'%3E%3C/path%3E%3Cpath d='m10 18-2 2 2 2'%3E%3C/path%3E%3Cpath d='m14 18 2 2-2 2'%3E%3C/path%3E%3C/svg%3E";

export function PresetScriptsLibrary({
  open,
  onOpenChange,
  onAddScript,
  currentScripts
}: PresetScriptsLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('analytics');
  const [showScriptForm, setShowScriptForm] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<PresetScript | null>(null);
  const [customScript, setCustomScript] = useState<Partial<PresetScript>>({
    id: '',
    name: '',
    src: '',
    category: 'analytics',
    async: true
  });

  const handleSelectPreset = (preset: PresetScript) => {
    setSelectedScript(preset);
    setCustomScript({
      id: preset.id,
      name: preset.name,
      src: preset.src,
      category: preset.category,
      async: preset.async
    });
    setShowScriptForm(true);
  };

  const handleSaveScript = () => {
    if (customScript.id && customScript.src) {
      const scriptToAdd = {
        id: customScript.id,
        src: customScript.src,
        async: customScript.async
      };
      onAddScript(scriptToAdd);
      setShowScriptForm(false);
      setSelectedScript(null);
      setCustomScript({
        id: '',
        name: '',
        src: '',
        category: 'analytics',
        async: true
      });
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
          <Tabs defaultValue="analytics" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="advertising">Advertising</TabsTrigger>
              <TabsTrigger value="functional">Functional</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>

            {['analytics', 'advertising', 'functional', 'social'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {PRESET_SCRIPTS.filter(script => script.category === category).map(script => (
                    <div 
                      key={script.id}
                      className="flex items-center p-3 border rounded-md hover:bg-gray-50"
                    >
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
                        onClick={() => handleSelectPreset(script)}
                        variant={isScriptAdded(script.id) ? "secondary" : "outline"}
                        size="sm"
                        disabled={isScriptAdded(script.id)}
                      >
                        {isScriptAdded(script.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4 py-2">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowScriptForm(false)} 
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
                  value={customScript.id || ''}
                  onChange={(e) => setCustomScript({...customScript, id: e.target.value})}
                  placeholder="unique-script-id"
                />
                <p className="text-xs text-muted-foreground">A unique identifier for this script</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="script-url">Script URL</Label>
                <Input 
                  id="script-url" 
                  value={customScript.src || ''}
                  onChange={(e) => setCustomScript({...customScript, src: e.target.value})}
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
                  value={customScript.category}
                  onChange={(e) => setCustomScript({
                    ...customScript, 
                    category: e.target.value as 'analytics' | 'advertising' | 'functional' | 'social'
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
                  checked={customScript.async}
                  onCheckedChange={(checked) => 
                    setCustomScript({...customScript, async: Boolean(checked)})
                  }
                />
                <Label htmlFor="script-async">Load asynchronously</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setShowScriptForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveScript}>
                Save Script
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
