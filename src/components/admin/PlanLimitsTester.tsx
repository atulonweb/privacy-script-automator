
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import usePlanLimits from '@/hooks/usePlanLimits';
import { toast } from 'sonner';

const PlanLimitsTester = () => {
  const { userPlan, planDetails, isLoading, enforcePlanLimits } = usePlanLimits();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runLimitTest = async (testName: string, testFunction: () => Promise<boolean> | boolean) => {
    try {
      const result = await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: result }));
      
      if (result) {
        toast.success(`✅ ${testName}: Passed`);
      } else {
        toast.warning(`❌ ${testName}: Failed (limit reached)`);
      }
    } catch (error) {
      console.error(`Error testing ${testName}:`, error);
      toast.error(`❌ ${testName}: Error occurred`);
      setTestResults(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testWebsiteCreation = () => runLimitTest('Website Creation', enforcePlanLimits.canCreateWebsite);
  const testWebhookUsage = () => runLimitTest('Webhook Usage', enforcePlanLimits.canUseWebhooks);
  const testWhiteLabelUsage = () => runLimitTest('White Label Usage', enforcePlanLimits.canUseWhiteLabel);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Limits Testing</CardTitle>
          <CardDescription>Loading plan information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Limits Testing</CardTitle>
        <CardDescription>
          Test current plan limits enforcement for real-time validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">Current Plan:</span>
          <Badge variant="outline" className="capitalize">{userPlan}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Plan Details</h4>
            <div className="text-sm space-y-1">
              <div>Website Limit: {planDetails.websiteLimit}</div>
              <div>Analytics History: {planDetails.analyticsHistory} days</div>
              <div>Webhooks: {planDetails.webhooksEnabled ? 'Enabled' : 'Disabled'}</div>
              <div>White Label: {planDetails.whiteLabel ? 'Enabled' : 'Disabled'}</div>
              <div>Customization: {planDetails.customization}</div>
              <div>Support Level: {planDetails.supportLevel}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Limit Tests</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testWebsiteCreation}
                >
                  Test Website Creation
                </Button>
                {testResults['Website Creation'] !== undefined && (
                  <Badge variant={testResults['Website Creation'] ? 'default' : 'destructive'}>
                    {testResults['Website Creation'] ? 'Pass' : 'Fail'}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testWebhookUsage}
                >
                  Test Webhook Usage
                </Button>
                {testResults['Webhook Usage'] !== undefined && (
                  <Badge variant={testResults['Webhook Usage'] ? 'default' : 'destructive'}>
                    {testResults['Webhook Usage'] ? 'Pass' : 'Fail'}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testWhiteLabelUsage}
                >
                  Test White Label
                </Button>
                {testResults['White Label Usage'] !== undefined && (
                  <Badge variant={testResults['White Label Usage'] ? 'default' : 'destructive'}>
                    {testResults['White Label Usage'] ? 'Pass' : 'Fail'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h5 className="font-medium text-sm mb-2">Analytics Retention</h5>
          <p className="text-sm text-muted-foreground">
            Current plan allows {enforcePlanLimits.getAnalyticsRetention()} days of analytics history
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanLimitsTester;
