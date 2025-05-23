
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WhiteLabelSettings from '@/components/WhiteLabelSettings';

const WhiteLabelPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">White Label Settings</h2>
        </div>
        <WhiteLabelSettings />
      </div>
    </DashboardLayout>
  );
};

export default WhiteLabelPage;
