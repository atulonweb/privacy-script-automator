
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const HowItWorks: React.FC = () => {
  return (
    <div className="rounded-lg border p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">How ConsentGuard Works</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="server-config">
          <AccordionTrigger>Server-Side Configuration</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3">
              When you add the ConsentGuard script to your website, it automatically loads your consent configuration from our secure servers using the script ID in the URL.
            </p>
            <p className="mb-3">
              This configuration includes:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2 mb-3">
              <li>Banner appearance settings (colors, position, text)</li>
              <li>Cookie categories and their descriptions</li>
              <li>Script blocking rules for each category</li>
              <li>Behavioral settings (auto-hide, powered by logo)</li>
            </ul>
            <p>
              This approach ensures your configuration is always up-to-date without requiring any changes to your website's code.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="script-blocking">
          <AccordionTrigger>Script Blocking & Consent Management</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3">
              ConsentGuard actively prevents third-party scripts from loading until the user provides consent. Here's how it works:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 ml-2 mb-3">
              <li>When a user visits your site, ConsentGuard checks for existing consent cookies</li>
              <li>If no consent exists, it displays the consent banner</li>
              <li>Third-party scripts are blocked until the user makes a choice</li>
              <li>After the user provides consent, ConsentGuard stores their preferences as cookies</li>
              <li>Only scripts in the approved categories are then loaded</li>
            </ol>
            <p>
              This process ensures your website complies with privacy regulations while respecting user preferences.
            </p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="data-attributes">
          <AccordionTrigger>Data Attributes & Advanced Tracking</AccordionTrigger>
          <AccordionContent>
            <p className="mb-3">
              The advanced implementation with data attributes enhances ConsentGuard with user-specific tracking:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2 mb-3">
              <li><code>data-user-id</code>: Associates consent choices with specific users in your system</li>
              <li><code>data-session-id</code>: Tracks consent for specific browsing sessions</li>
            </ul>
            <p className="mb-3">
              These attributes are included in webhook payloads and analytics data, allowing you to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Track consent changes for specific users over time</li>
              <li>Integrate consent data with your CRM or user database</li>
              <li>Analyze consent patterns across different user segments</li>
              <li>Comply with data subject access requests more easily</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="visual-example">
          <AccordionTrigger>Visual Workflow</AccordionTrigger>
          <AccordionContent>
            <div className="mb-3">
              <p className="mb-3">ConsentGuard workflow:</p>
              <div className="border rounded-md p-3 bg-gray-50">
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>User visits website with ConsentGuard script</li>
                  <li>Banner appears, blocking third-party scripts</li>
                  <li>User makes consent choice</li>
                  <li>Preferences are saved as cookies</li>
                  <li>Approved scripts are loaded</li>
                  <li>"Cookie Settings" button remains for preference changes</li>
                </ol>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The consent banner, customization panel, and settings button are all managed automatically by the ConsentGuard script.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default HowItWorks;
