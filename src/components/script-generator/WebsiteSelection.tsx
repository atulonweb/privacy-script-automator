
import React from 'react';
import { Loader, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Website } from '@/hooks/useWebsites';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import usePlanLimits from '@/hooks/usePlanLimits';

interface WebsiteSelectionProps {
  websites: Website[];
  loadingWebsites: boolean;
  websiteId: string;
  setWebsiteId: (id: string) => void;
  onNext: () => void;
}

const WebsiteSelection: React.FC<WebsiteSelectionProps> = ({
  websites,
  loadingWebsites,
  websiteId,
  setWebsiteId,
  onNext,
}) => {
  const navigate = useNavigate();
  const { planDetails, userPlan, websiteCount, enforcePlanLimits } = usePlanLimits();

  const handleNext = () => {
    if (!websiteId) {
      toast.error("Please select a website first");
      return;
    }

    // Check if webhooks are enabled for the plan
    if (!enforcePlanLimits.canUseWebhooks()) {
      // The hook already shows the appropriate error message
      return;
    }

    onNext();
  };

  const isOverLimit = websiteCount > planDetails.websiteLimit;
  const allowedWebsites = websites.slice(0, planDetails.websiteLimit);
  const excessWebsites = websites.slice(planDetails.websiteLimit);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select Website</h3>
        <p className="text-sm text-muted-foreground">
          Choose the website where this consent banner will be used.
          You have {websiteCount} of {planDetails.websiteLimit} websites on your {userPlan} plan.
        </p>
      </div>

      {/* Plan limit warnings */}
      {isOverLimit && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Plan Limit Exceeded:</strong> You have {websiteCount} websites but your {userPlan} plan only allows {planDetails.websiteLimit}. 
            Only websites within your plan limit can be used for script generation.
          </AlertDescription>
        </Alert>
      )}

      {!planDetails.webhooksEnabled && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Feature Limitation:</strong> Webhooks are not available on your {userPlan} plan. 
            You can still create scripts, but webhook functionality will be disabled.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {loadingWebsites ? (
          <div className="flex justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            {websites.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website-select">Select Website</Label>
                  <Select
                    value={websiteId}
                    onValueChange={setWebsiteId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a website" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedWebsites.map((website) => (
                        <SelectItem key={website.id} value={website.id}>
                          {website.name} ({website.domain})
                        </SelectItem>
                      ))}
                      {excessWebsites.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs text-gray-500 font-medium border-t">
                            Exceeds Plan Limit (Disabled)
                          </div>
                          {excessWebsites.map((website) => (
                            <SelectItem 
                              key={website.id} 
                              value={website.id} 
                              disabled
                              className="text-gray-400"
                            >
                              {website.name} ({website.domain}) - Upgrade Required
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan features summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Current Plan Features ({userPlan})</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Websites:</span> {websiteCount}/{planDetails.websiteLimit}
                    </div>
                    <div>
                      <span className="font-medium">Analytics:</span> {planDetails.analyticsHistory} days
                    </div>
                    <div>
                      <span className="font-medium">Webhooks:</span>
                      <span className={planDetails.webhooksEnabled ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                        {planDetails.webhooksEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">White Label:</span>
                      <span className={planDetails.whiteLabel ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                        {planDetails.whiteLabel ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You don't have any websites yet. Add a website first.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/dashboard/websites')}
                >
                  Go to Websites
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {websiteId && (
        <Button 
          className="bg-brand-600 hover:bg-brand-700" 
          onClick={handleNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default WebsiteSelection;
