
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

const ScriptExplanation: React.FC = () => {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>How Your Consent Script Works</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          This script provides complete cookie consent management for your website:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
          <li>Blocks third-party scripts until consent is given</li>
          <li>Manages user consent preferences</li>
          <li>Ensures GDPR, CCPA and other privacy regulation compliance</li>
          <li>Stores user preferences as cookies</li>
          <li>Automatically loads approved scripts after consent</li>
        </ul>
        <p className="mt-2 text-sm">
          The configuration for your script (including design settings and script blocking rules) is loaded remotely using the script ID in the URL.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default ScriptExplanation;
