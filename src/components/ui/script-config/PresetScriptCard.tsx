
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PresetScript } from '@/types/scripts-config.types';
import ScriptIcon from '@/components/ui/script-icon';
import { InfoIcon, ExternalLinkIcon, HelpCircleIcon } from 'lucide-react';

interface PresetScriptCardProps {
  script: PresetScript;
  isAdded: boolean;
  onSelect: (script: PresetScript) => void;
}

export function PresetScriptCard({ script, isAdded, onSelect }: PresetScriptCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const getSetupInstructions = (scriptId: string) => {
    const instructions = {
      'google-analytics-4': {
        title: 'Google Analytics 4 Setup',
        steps: [
          'Go to https://analytics.google.com/',
          'Sign in with your Google account',
          'Click "Start measuring" to create a new property',
          'Enter your website details and create the property',
          'Copy your Measurement ID (format: G-XXXXXXXXXX)',
          'Replace "REPLACE_WITH_YOUR_GA4_MEASUREMENT_ID" in the script URL with your actual Measurement ID'
        ],
        links: [
          { text: 'Google Analytics', url: 'https://analytics.google.com/' },
          { text: 'GA4 Setup Guide', url: 'https://support.google.com/analytics/answer/9304153' }
        ],
        note: 'Your Measurement ID should look like: G-XXXXXXXXXX'
      },
      'google-universal-analytics': {
        title: 'Google Universal Analytics Setup',
        steps: [
          'Go to https://analytics.google.com/',
          'Sign in with your Google account',
          'Create a Universal Analytics property (if not already created)',
          'Copy your Tracking ID (format: UA-XXXXXXXX-X)',
          'Replace "REPLACE_WITH_YOUR_UA_TRACKING_ID" in the script with your actual Tracking ID'
        ],
        links: [
          { text: 'Google Analytics', url: 'https://analytics.google.com/' },
          { text: 'Universal Analytics Guide', url: 'https://support.google.com/analytics/answer/1008015' }
        ],
        note: 'Note: Universal Analytics stopped processing data on July 1, 2023. Consider using GA4 instead.'
      },
      'matomo': {
        title: 'Matomo (Piwik) Setup',
        steps: [
          'Sign up at https://matomo.org/ or set up self-hosted Matomo',
          'Create a new website in your Matomo dashboard',
          'Go to Administration > Websites > Manage',
          'Copy your Site ID and Matomo URL',
          'Replace "YOUR_MATOMO_URL" and "YOUR_SITE_ID" in the script configuration'
        ],
        links: [
          { text: 'Matomo Cloud', url: 'https://matomo.org/' },
          { text: 'Matomo Setup Guide', url: 'https://matomo.org/docs/installation/' }
        ],
        note: 'Matomo is a privacy-focused analytics platform that can be self-hosted.'
      },
      'hotjar': {
        title: 'Hotjar Setup',
        steps: [
          'Sign up at https://www.hotjar.com/',
          'Create a new site in your Hotjar dashboard',
          'Go to Settings > Sites & Organizations',
          'Copy your Site ID from the tracking code',
          'Replace "YOUR_HOTJAR_ID" in the script configuration with your actual Site ID'
        ],
        links: [
          { text: 'Hotjar', url: 'https://www.hotjar.com/' },
          { text: 'Hotjar Installation Guide', url: 'https://help.hotjar.com/hc/en-us/articles/115009336727' }
        ],
        note: 'Hotjar provides heatmaps, session recordings, and user feedback tools.'
      },
      'facebook-pixel': {
        title: 'Facebook Pixel Setup',
        steps: [
          'Go to https://business.facebook.com/events_manager',
          'Create a new pixel or select an existing one',
          'Copy your Pixel ID (numeric value)',
          'Replace "YOUR_PIXEL_ID" in the script configuration with your actual Pixel ID'
        ],
        links: [
          { text: 'Facebook Events Manager', url: 'https://business.facebook.com/events_manager' },
          { text: 'Pixel Setup Guide', url: 'https://www.facebook.com/business/help/952192354843755' }
        ],
        note: 'Facebook Pixel helps track conversions and optimize ad campaigns.'
      }
    };

    return instructions[scriptId] || {
      title: 'Setup Instructions',
      steps: [
        'Visit the service provider\'s website',
        'Create an account or sign in',
        'Follow their integration guide',
        'Copy the required IDs or tokens',
        'Replace placeholder values in the script configuration'
      ],
      links: [],
      note: 'Refer to the service provider\'s documentation for detailed setup instructions.'
    };
  };

  const instructions = getSetupInstructions(script.id);

  return (
    <TooltipProvider>
      <Card className="border border-border/50 hover:border-border transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <ScriptIcon scriptId={script.id} className="w-8 h-8" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm truncate">{script.name}</h4>
                  {script.helpText && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Setup Help:</p>
                          <p className="text-xs">{script.helpText}</p>
                          {script.docUrl && (
                            <a
                              href={script.docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <ExternalLinkIcon className="h-3 w-3" />
                              <span>Learn more</span>
                            </a>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {script.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {script.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Setup Instructions"
                  >
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <ScriptIcon scriptId={script.id} className="w-6 h-6" />
                      <span>{instructions.title}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <InfoIcon className="h-4 w-4" />
                      <AlertDescription>
                        Follow these steps to properly configure {script.name} for your website.
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Setup Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        {instructions.steps.map((step, index) => (
                          <li key={index} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {script.docUrl && (
                      <div>
                        <h4 className="font-semibold mb-2">Official Documentation:</h4>
                        <a
                          href={script.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ExternalLinkIcon className="h-3 w-3" />
                          <span>View {script.name} documentation</span>
                        </a>
                      </div>
                    )}

                    {instructions.links.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Helpful Links:</h4>
                        <div className="space-y-2">
                          {instructions.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <ExternalLinkIcon className="h-3 w-3" />
                              <span>{link.text}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <Alert>
                      <AlertDescription className="text-sm">
                        <strong>Important:</strong> {instructions.note}
                      </AlertDescription>
                    </Alert>

                    <div className="bg-muted p-3 rounded-md">
                      <h4 className="font-semibold mb-2 text-sm">After Setup:</h4>
                      <p className="text-sm text-muted-foreground">
                        Once you have your tracking ID or configuration details, click the "Add" button 
                        and replace any placeholder values (like YOUR_SITE_ID, REPLACE_WITH_YOUR_ID) 
                        with your actual values before saving.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                variant={isAdded ? "secondary" : "default"}
                size="sm"
                onClick={() => onSelect(script)}
                disabled={isAdded}
                className="h-8"
              >
                {isAdded ? "Added" : "Add"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
