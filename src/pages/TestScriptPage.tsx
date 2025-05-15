
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomizeDialog } from '@/components/ui/customize-dialog';
import { useScriptData } from '@/hooks/useScriptData';
import { useScriptTesting } from '@/hooks/useScriptTesting';
import BasicTestingTab from '@/components/test-script/BasicTestingTab';
import AdvancedTestingTab from '@/components/test-script/AdvancedTestingTab';
import MonitoringTab from '@/components/test-script/MonitoringTab';

const TestScriptPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  
  // Get script data
  const { 
    scriptData, 
    websiteName, 
    loading, 
    scriptsLoading 
  } = useScriptData();

  // Handle script testing
  const {
    showPreview,
    togglePreview,
    testError,
    consoleLogs,
    cookies,
    scriptConfiguration,
    handleSaveConfiguration
  } = useScriptTesting({ scriptData });

  const handleBack = () => {
    navigate('/dashboard/scripts');
  };

  if (loading || scriptsLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <Loader className="h-8 w-8 animate-spin text-brand-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading script data...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!scriptData) {
    return (
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBack} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scripts
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Script not found. Please select a script to test from the scripts list.</p>
              <Button onClick={handleBack} className="bg-brand-600 hover:bg-brand-700">
                Back to Scripts
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scripts
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Test Script</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testing "{websiteName}" Consent Script</CardTitle>
            <CardDescription>
              Preview how your consent banner will appear to visitors and test the enhanced script loading
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                Testing mode is active. No analytics data will be recorded during this preview.
              </AlertDescription>
            </Alert>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Testing</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Testing</TabsTrigger>
                <TabsTrigger value="monitoring">Console & Cookies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <BasicTestingTab 
                  scriptData={scriptData}
                  showPreview={showPreview}
                  togglePreview={togglePreview}
                  testError={testError}
                />
              </TabsContent>
              
              <TabsContent value="advanced">
                <AdvancedTestingTab 
                  scriptData={scriptData}
                  showPreview={showPreview}
                  togglePreview={togglePreview}
                  scriptConfiguration={scriptConfiguration}
                  setShowCustomizeDialog={setShowCustomizeDialog}
                />
              </TabsContent>
              
              <TabsContent value="monitoring">
                <MonitoringTab 
                  showPreview={showPreview}
                  togglePreview={togglePreview}
                  consoleLogs={consoleLogs}
                  cookies={cookies}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <CustomizeDialog 
        open={showCustomizeDialog}
        onOpenChange={setShowCustomizeDialog}
        onSave={handleSaveConfiguration}
        initialSettings={scriptConfiguration}
      />
    </DashboardLayout>
  );
};

export default TestScriptPage;
