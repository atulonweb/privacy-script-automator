
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  // General Settings
  const [appName, setAppName] = useState<string>('ConsentGuard');
  const [supportEmail, setSupportEmail] = useState<string>('support@consentguard.com');
  
  // User Settings
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(true);
  const [allowUserRegistration, setAllowUserRegistration] = useState<boolean>(true);
  
  // Script Settings
  const [defaultBannerPosition, setDefaultBannerPosition] = useState<string>('bottom');
  const [defaultBannerColor, setDefaultBannerColor] = useState<string>('#1e3a8a');
  const [defaultTextColor, setDefaultTextColor] = useState<string>('#ffffff');
  const [defaultButtonColor, setDefaultButtonColor] = useState<string>('#3b82f6');
  const [defaultButtonTextColor, setDefaultButtonTextColor] = useState<string>('#ffffff');
  const [showPoweredBy, setShowPoweredBy] = useState<boolean>(true);
  
  // Load settings from the database or localStorage for demo
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Try to fetch settings from localStorage first
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setAppName(settings.appName || 'ConsentGuard');
          setSupportEmail(settings.supportEmail || 'support@consentguard.com');
          setRequireEmailVerification(settings.requireEmailVerification !== undefined ? settings.requireEmailVerification : true);
          setAllowUserRegistration(settings.allowUserRegistration !== undefined ? settings.allowUserRegistration : true);
          setDefaultBannerPosition(settings.defaultBannerPosition || 'bottom');
          setDefaultBannerColor(settings.defaultBannerColor || '#1e3a8a');
          setDefaultTextColor(settings.defaultTextColor || '#ffffff');
          setDefaultButtonColor(settings.defaultButtonColor || '#3b82f6');
          setDefaultButtonTextColor(settings.defaultButtonTextColor || '#ffffff');
          setShowPoweredBy(settings.showPoweredBy !== undefined ? settings.showPoweredBy : true);
        }
        
        // In a real implementation, you would fetch settings from Supabase
        // const { data, error } = await supabase.from('admin_settings').select('*').single();
        // if (error) throw error;
        // if (data) {
        //   setAppName(data.app_name);
        //   setSupportEmail(data.support_email);
        //   // ... set other settings from data
        // }
      } catch (error: any) {
        console.error('Error loading settings:', error);
        toast.error(`Failed to load settings: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save settings to localStorage for demo purposes
      const settings = {
        appName,
        supportEmail,
        requireEmailVerification,
        allowUserRegistration,
        defaultBannerPosition,
        defaultBannerColor,
        defaultTextColor,
        defaultButtonColor,
        defaultButtonTextColor,
        showPoweredBy
      };
      
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      // In a real implementation, you would save to the Supabase database:
      // const { error } = await supabase.from('admin_settings').upsert({
      //   app_name: appName,
      //   support_email: supportEmail,
      //   // ... other settings
      // });
      // 
      // if (error) throw error;
      
      // Show success message
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="scripts">Default Scripts</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Enter application name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="Enter support email"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving || loading}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* User Management Settings */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management Settings</CardTitle>
                <CardDescription>
                  Configure user registration and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="emailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before they can sign in
                    </p>
                  </div>
                  <Switch
                    id="emailVerification"
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="allowRegistration">Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register for an account
                    </p>
                  </div>
                  <Switch
                    id="allowRegistration"
                    checked={allowUserRegistration}
                    onCheckedChange={setAllowUserRegistration}
                  />
                </div>
                
                <div className="rounded-md bg-amber-50 p-4 mt-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Important Notice</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Changes to email verification settings will affect all future registrations.
                          These settings can only be changed by an administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving || loading}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Script Settings */}
          <TabsContent value="scripts">
            <Card>
              <CardHeader>
                <CardTitle>Default Script Settings</CardTitle>
                <CardDescription>
                  Configure default appearance and behavior for consent scripts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bannerPosition">Default Banner Position</Label>
                  <select
                    id="bannerPosition"
                    value={defaultBannerPosition}
                    onChange={(e) => setDefaultBannerPosition(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="floating">Floating</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bannerColor">Default Banner Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bannerColor"
                        type="text"
                        value={defaultBannerColor}
                        onChange={(e) => setDefaultBannerColor(e.target.value)}
                        placeholder="#1e3a8a"
                      />
                      <Input
                        type="color"
                        value={defaultBannerColor}
                        onChange={(e) => setDefaultBannerColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Default Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="text"
                        value={defaultTextColor}
                        onChange={(e) => setDefaultTextColor(e.target.value)}
                        placeholder="#ffffff"
                      />
                      <Input
                        type="color"
                        value={defaultTextColor}
                        onChange={(e) => setDefaultTextColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor">Default Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonColor"
                        type="text"
                        value={defaultButtonColor}
                        onChange={(e) => setDefaultButtonColor(e.target.value)}
                        placeholder="#3b82f6"
                      />
                      <Input
                        type="color"
                        value={defaultButtonColor}
                        onChange={(e) => setDefaultButtonColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonTextColor">Default Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonTextColor"
                        type="text"
                        value={defaultButtonTextColor}
                        onChange={(e) => setDefaultButtonTextColor(e.target.value)}
                        placeholder="#ffffff"
                      />
                      <Input
                        type="color"
                        value={defaultButtonTextColor}
                        onChange={(e) => setDefaultButtonTextColor(e.target.value)}
                        className="w-12 p-1 h-10"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="poweredBy">Show "Powered By" Label</Label>
                    <p className="text-sm text-muted-foreground">
                      Display "Powered by ConsentGuard" in scripts by default
                    </p>
                  </div>
                  <Switch
                    id="poweredBy"
                    checked={showPoweredBy}
                    onCheckedChange={setShowPoweredBy}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving || loading}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
