
import React from 'react';
import { Website } from '@/hooks/useWebsites';

// Import refactored sections
import WebsiteInfo from './sections/WebsiteInfo';
import BasicScriptSection from './sections/BasicScriptSection';
import AdvancedScriptSection from './sections/AdvancedScriptSection';
import PrivacyFeaturesSection from './sections/PrivacyFeaturesSection';

interface ScriptImplementationProps {
  scriptId: string;
  website: Website | undefined;
}

const ScriptImplementation: React.FC<ScriptImplementationProps> = ({ scriptId, website }) => {
  return (
    <div className="space-y-6">
      <WebsiteInfo website={website} />
      
      <BasicScriptSection scriptId={scriptId} />
      
      <AdvancedScriptSection scriptId={scriptId} />
      
      <PrivacyFeaturesSection />
    </div>
  );
};

export default ScriptImplementation;
