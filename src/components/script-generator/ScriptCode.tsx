
import React, { useState } from 'react';
import { Website } from '@/hooks/useWebsites';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import refactored components
import SuccessAlert from './SuccessAlert';
import ScriptImplementation from './ScriptImplementation';
import ScriptPreview from './ScriptPreview';
import ScriptExplanation from './ScriptExplanation';
import NavigationButtons from './NavigationButtons';
import WebhookSettings from './WebhookSettings';

interface ScriptCodeProps {
  scriptId: string;
  website: Website | undefined;
}

const ScriptCode: React.FC<ScriptCodeProps> = ({ scriptId, website }) => {
  const [activeTab, setActiveTab] = useState('script');

  return (
    <div className="space-y-6">
      <SuccessAlert />
      
      <Tabs defaultValue="script" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="script">Script Installation</TabsTrigger>
          <TabsTrigger value="webhook" disabled={!website}>Webhook Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="script" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Your Consent Script</h3>
            <p className="text-sm text-muted-foreground">
              Add this script to your website's &lt;head&gt; tag.
            </p>
          </div>

          <ScriptExplanation />

          <ScriptImplementation scriptId={scriptId} website={website} />
          
          <ScriptPreview scriptId={scriptId} />
        </TabsContent>

        <TabsContent value="webhook">
          {website && <WebhookSettings website={website} />}
        </TabsContent>
      </Tabs>

      <NavigationButtons />
    </div>
  );
};

export default ScriptCode;
