
import React from 'react';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Website } from '@/hooks/useWebsites';
import { toast } from 'sonner';

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

  const handleNext = () => {
    if (!websiteId) {
      toast.error("Please select a website first");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Select Website</h3>
        <p className="text-sm text-muted-foreground">
          Choose the website where this consent banner will be used.
        </p>
      </div>

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
                      {websites.map((website) => (
                        <SelectItem key={website.id} value={website.id}>
                          {website.name} ({website.domain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  onClick={() => navigate('/dashboard', { replace: true })}
                >
                  Go to Dashboard
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
