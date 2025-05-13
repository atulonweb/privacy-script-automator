
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useScripts } from '@/hooks/useScripts';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// This is a test component to isolate and debug script saving issues
const ScriptSavingTest: React.FC = () => {
  const { addScript } = useScripts();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('Not started');
  const [isLoading, setIsLoading] = useState(false);

  const runSaveTest = async () => {
    if (!user) {
      toast.error("You must be logged in to run this test");
      setTestResult('Failed: Not logged in');
      return;
    }

    setIsLoading(true);
    setTestResult('Running test...');

    try {
      console.log('Test: Starting script creation');
      
      // Generate a unique ID for test
      const scriptId = 'test_' + Math.random().toString(36).substring(2, 15);
      const testWebsiteId = localStorage.getItem('testWebsiteId');
      
      if (!testWebsiteId) {
        setTestResult('Failed: No website ID found in localStorage. Please set one first.');
        toast.error("Please set a test website ID first");
        setIsLoading(false);
        return;
      }

      // Create test script data
      const testScript = {
        website_id: testWebsiteId,
        script_id: scriptId,
        banner_position: 'bottom',
        banner_color: '#2563eb',
        text_color: '#ffffff',
        button_color: '#ffffff',
        button_text_color: '#2563eb',
        show_powered_by: true,
        auto_hide: false,
        auto_hide_time: 30
      };

      console.log('Test: Sending script data to addScript', testScript);
      
      // Call the addScript function
      const result = await addScript(testScript);
      
      console.log('Test: addScript result:', result);
      
      if (result && result.id) {
        setTestResult(`Success: Script created with ID ${result.id}`);
        toast.success("Test passed! Script was created successfully");
      } else {
        setTestResult('Failed: Script was created but no ID was returned');
        toast.error("Test failed - no ID returned");
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResult(`Failed: ${error.message || 'Unknown error'}`);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setTestWebsiteId = () => {
    const websiteId = prompt('Enter a valid website ID to use for testing:');
    if (websiteId) {
      localStorage.setItem('testWebsiteId', websiteId);
      toast.success('Test website ID saved');
    }
  };

  return (
    <div className="p-4 border rounded-md space-y-4">
      <h2 className="text-xl font-bold">Script Saving Test</h2>
      
      <div className="space-y-2">
        <p>Test Result: <span className={
          testResult.includes('Success') ? 'text-green-600' :
          testResult.includes('Failed') ? 'text-red-600' :
          'text-gray-600'
        }>{testResult}</span></p>
        
        <div className="space-x-4">
          <Button onClick={setTestWebsiteId} variant="outline">
            Set Test Website ID
          </Button>
          
          <Button 
            onClick={runSaveTest} 
            disabled={isLoading}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {isLoading ? 'Running Test...' : 'Run Save Test'}
          </Button>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Note: This test will attempt to create a real script in the database.</p>
        <p>Current website ID for testing: {localStorage.getItem('testWebsiteId') || 'Not set'}</p>
      </div>
    </div>
  );
};

export default ScriptSavingTest;
