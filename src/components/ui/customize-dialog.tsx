
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Sliders } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  checked: boolean;
}

interface CustomizeDialogProps {
  onSavePreferences: (preferences: Record<string, boolean>) => void;
}

export function CustomizeDialog({ onSavePreferences }: CustomizeDialogProps) {
  const [categories, setCategories] = React.useState<CookieCategory[]>([
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Sliders className="h-4 w-4" />
          <span>Customize</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Customize which cookies you want to accept. Essential cookies cannot be disabled as they are necessary for the website to function properly.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 my-4">
          <div className="space-y-5">
            {categories.map((category) => (
              <div key={category.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={category.id} className="text-base font-medium">
                      {category.name}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                          <InfoIcon className="h-3 w-3" />
                          <span className="sr-only">Info</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                          
                          {category.id === "essential" && (
                            <div className="pt-2">
                              <h5 className="text-sm font-medium">Included Cookies:</h5>
                              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                <li>Session cookies</li>
                                <li>CSRF token cookies</li>
                                <li>Authentication cookies</li>
                              </ul>
                            </div>
                          )}
                          
                          {category.id === "functional" && (
                            <div className="pt-2">
                              <h5 className="text-sm font-medium">Included Cookies:</h5>
                              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                <li>Language preference cookies</li>
                                <li>Theme preference cookies</li>
                                <li>Personalization cookies</li>
                              </ul>
                            </div>
                          )}
                          
                          {category.id === "analytics" && (
                            <div className="pt-2">
                              <h5 className="text-sm font-medium">Included Cookies:</h5>
                              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                <li>Google Analytics cookies</li>
                                <li>Usage statistics cookies</li>
                                <li>Performance monitoring cookies</li>
                              </ul>
                            </div>
                          )}
                          
                          {category.id === "marketing" && (
                            <div className="pt-2">
                              <h5 className="text-sm font-medium">Included Cookies:</h5>
                              <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1">
                                <li>Advertising cookies</li>
                                <li>Retargeting cookies</li>
                                <li>Social media cookies</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Switch
                    id={category.id}
                    checked={category.checked}
                    disabled={category.required}
                    onCheckedChange={(checked) => handleSwitchChange(category.id, checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
                {category.required && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    This cookie category cannot be disabled as it is essential for the website to function properly.
                  </p>
                )}
              </div>
            ))}
            
            <div className="pt-2">
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
        
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setCategories(categories.map(cat => ({...cat, checked: false})));
              setTimeout(() => handleSavePreferences(), 100);
            }}>
              Reject All
            </Button>
            <Button onClick={() => {
              setCategories(categories.map(cat => ({...cat, checked: true})));
              setTimeout(() => handleSavePreferences(), 100);
            }}>
              Accept All
            </Button>
          </div>
          <Button onClick={handleSavePreferences} className="ml-auto">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
