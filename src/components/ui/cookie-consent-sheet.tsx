
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sliders } from "lucide-react";

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  checked: boolean;
}

interface CookieConsentSheetProps {
  onSavePreferences: (preferences: Record<string, boolean>) => void;
}

export function CookieConsentSheet({ onSavePreferences }: CookieConsentSheetProps) {
  const [categories, setCategories] = useState<CookieCategory[]>([
    {
      id: "essential",
      name: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off.",
      required: true,
      checked: true,
    },
    {
      id: "functional",
      name: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization.",
      required: false,
      checked: true,
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with the website.",
      required: false,
      checked: true,
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites to display relevant advertisements.",
      required: false,
      checked: false,
    },
  ]);

  const handleSwitchChange = (id: string, checked: boolean) => {
    setCategories(
      categories.map((category) =>
        category.id === id ? { ...category, checked } : category
      )
    );
  };

  const handleSavePreferences = () => {
    const preferences = categories.reduce(
      (acc, category) => ({ ...acc, [category.id]: category.checked }),
      {} as Record<string, boolean>
    );
    onSavePreferences(preferences);
  };

  const handleAcceptAll = () => {
    setCategories(categories.map(cat => ({ ...cat, checked: true })));
    const preferences = categories.reduce(
      (acc, category) => ({ ...acc, [category.id]: true }),
      {} as Record<string, boolean>
    );
    onSavePreferences(preferences);
  };

  const handleRejectAll = () => {
    setCategories(categories.map(cat => 
      ({ ...cat, checked: cat.required })
    ));
    const preferences = categories.reduce(
      (acc, category) => ({ ...acc, [category.id]: category.required }),
      {} as Record<string, boolean>
    );
    onSavePreferences(preferences);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Sliders className="h-4 w-4" />
          <span>Customize</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Cookie Preferences</SheetTitle>
          <SheetDescription>
            Customize which cookies you want to accept. Essential cookies cannot be disabled as they are necessary for the website to function properly.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[60vh] mt-6">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={category.id} className="text-base font-medium">
                    {category.name}
                  </Label>
                  <Switch
                    id={category.id}
                    checked={category.checked}
                    disabled={category.required}
                    onCheckedChange={(checked) => handleSwitchChange(category.id, checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                {category.required && (
                  <p className="text-xs text-muted-foreground italic">
                    This cookie category cannot be disabled as it is essential for the website to function properly.
                  </p>
                )}
                <Separator className="mt-2" />
              </div>
            ))}
            
            <div className="pt-4">
              <h3 className="text-base font-medium mb-2">Additional Information</h3>
              <p className="text-sm text-muted-foreground">
                For more information about how we use cookies and your personal data, please visit our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="mt-6 flex flex-row justify-between gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
          <Button onClick={handleSavePreferences} className="ml-auto">
            Save Preferences
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
