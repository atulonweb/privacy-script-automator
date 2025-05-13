
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface AppearanceSettingsProps {
  bannerPosition: string;
  setBannerPosition: (position: string) => void;
  bannerColor: string;
  setBannerColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  buttonColor: string;
  setButtonColor: (color: string) => void;
  buttonTextColor: string;
  setButtonTextColor: (color: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  bannerPosition,
  setBannerPosition,
  bannerColor,
  setBannerColor,
  textColor,
  setTextColor,
  buttonColor,
  setButtonColor,
  buttonTextColor,
  setButtonTextColor,
  onNext,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Banner Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how your consent banner will look.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Banner Position</Label>
          <RadioGroup 
            value={bannerPosition}
            onValueChange={setBannerPosition}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bottom" id="position-bottom" />
              <Label htmlFor="position-bottom">Bottom</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="top" id="position-top" />
              <Label htmlFor="position-top">Top</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bottom-left" id="position-bottom-left" />
              <Label htmlFor="position-bottom-left">Bottom Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bottom-right" id="position-bottom-right" />
              <Label htmlFor="position-bottom-right">Bottom Right</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-color">Banner Color</Label>
          <div className="flex space-x-2">
            <Input 
              type="color" 
              id="banner-color" 
              value={bannerColor}
              onChange={(e) => setBannerColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input 
              type="text" 
              value={bannerColor}
              onChange={(e) => setBannerColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-color">Text Color</Label>
          <div className="flex space-x-2">
            <Input 
              type="color" 
              id="text-color" 
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input 
              type="text" 
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-color">Button Color</Label>
          <div className="flex space-x-2">
            <Input 
              type="color" 
              id="button-color" 
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input 
              type="text" 
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-text-color">Button Text Color</Label>
          <div className="flex space-x-2">
            <Input 
              type="color" 
              id="button-text-color" 
              value={buttonTextColor}
              onChange={(e) => setButtonTextColor(e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input 
              type="text" 
              value={buttonTextColor}
              onChange={(e) => setButtonTextColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
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
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
