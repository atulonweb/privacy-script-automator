
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ScriptWizard from '@/components/ScriptWizard';
import HowItWorks from '@/components/script-generator/HowItWorks';

const ScriptGeneratorPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Create New Script</h2>
        </div>
        
        <div className="mt-8">
          <ScriptWizard />
        </div>
        
        <HowItWorks />
      </div>
    </DashboardLayout>
  );
};

export default ScriptGeneratorPage;
