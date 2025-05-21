
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import usePlanLimits from '@/hooks/usePlanLimits';

const PlanFeatureTable: React.FC = () => {
  const { planDetails, userPlan, isLoading } = usePlanLimits();

  if (isLoading) {
    return <div className="text-center py-4">Loading plan details...</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-muted p-4 border-b">
        <h3 className="text-lg font-medium capitalize">{userPlan} Plan Features</h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Website Limit</p>
            <p className="text-sm text-muted-foreground">{planDetails.websiteLimit} websites</p>
          </div>
          <div>
            <p className="font-medium">Analytics History</p>
            <p className="text-sm text-muted-foreground">{planDetails.analyticsHistory} days</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {planDetails.webhooksEnabled ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <p className="font-medium">Webhooks</p>
          </div>
          <div className="flex items-center space-x-2">
            {planDetails.whiteLabel ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <p className="font-medium">White Labeling</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Customization Level</p>
            <p className="text-sm text-muted-foreground capitalize">{planDetails.customization}</p>
          </div>
          <div>
            <p className="font-medium">Support Level</p>
            <p className="text-sm text-muted-foreground capitalize">{planDetails.supportLevel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanFeatureTable;
