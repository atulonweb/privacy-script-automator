
import React from 'react';
import ScriptGenerator from '@/components/ScriptGenerator';
import { Card, CardContent } from '@/components/ui/card';

const ScriptWizard: React.FC = () => {
  return (
    <div className="w-full">
      <Card>
        <CardContent className="p-0">
          <ScriptGenerator />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptWizard;
