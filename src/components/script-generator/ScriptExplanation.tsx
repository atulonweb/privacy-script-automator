
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const ScriptExplanation: React.FC = () => {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div>
            <strong>Basic Script:</strong> Pure consent management - shows consent banner, blocks external tracking scripts, and manages user preferences. Does NOT include any tracking by default.
          </div>
          <div>
            <strong>Advanced Script:</strong> Consent management + custom script loading - includes all basic features plus loads your configured tracking scripts (Google Analytics, etc.) after consent is given.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ScriptExplanation;
