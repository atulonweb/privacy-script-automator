
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ScriptSavingTest from '@/tests/ScriptSavingTest';
import WebhookTester from '@/tests/WebhookTester';
import UserWebhooksTest from '@/tests/UserWebhooksTest';

const TestingPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Testing Tools</h2>
        </div>
        
        <div className="grid gap-4">
          <UserWebhooksTest />
          <WebhookTester />
          <ScriptSavingTest />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestingPage;
