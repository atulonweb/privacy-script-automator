
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Loader } from 'lucide-react';

interface BehaviorSettingsProps {
  showPoweredBy: boolean;
  setShowPoweredBy: (show: boolean) => void;
  autoHide: boolean;
  setAutoHide: (hide: boolean) => void;
  autoHideTime: number;
  setAutoHideTime: (time: number) => void;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const BehaviorSettings: React.FC<BehaviorSettingsProps> = ({
  showPoweredBy,
  setShowPoweredBy,
  autoHide,
  setAutoHide,
  autoHideTime,
  setAutoHideTime,
  loading,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Banner Behavior</h3>
        <p className="text-sm text-muted-foreground">
          Configure how your consent banner behaves.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="powered-by" className="block">Show "Powered by ConsentGuard"</Label>
            <p className="text-sm text-muted-foreground">Display our branding on your consent banner.</p>
          </div>
          <Switch 
            id="powered-by" 
            checked={showPoweredBy}
            onCheckedChange={setShowPoweredBy}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-hide" className="block">Auto-hide Banner</Label>
            <p className="text-sm text-muted-foreground">Automatically hide the banner after a time period.</p>
          </div>
          <Switch 
            id="auto-hide" 
            checked={autoHide}
            onCheckedChange={setAutoHide}
          />
        </div>

        {autoHide && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="auto-hide-time">Hide After (seconds): {autoHideTime}</Label>
            </div>
            <Slider
              id="auto-hide-time"
              min={5}
              max={60}
              step={5}
              value={[autoHideTime]}
              onValueChange={(value) => setAutoHideTime(value[0])}
              className="py-4"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          className="bg-brand-600 hover:bg-brand-700" 
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : 'Generate Script'}
        </Button>
      </div>
    </div>
  );
};

export default BehaviorSettings;
