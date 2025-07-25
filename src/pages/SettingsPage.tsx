
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WebhookSettings from '@/components/script-generator/WebhookSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsites, Website } from '@/hooks/useWebsites';
import usePlanLimits from '@/hooks/usePlanLimits';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { websites } = useWebsites();
  const { planDetails, userPlan } = usePlanLimits();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    // Set the first website as selected if available
    if (websites.length > 0 && !selectedWebsite) {
      setSelectedWebsite(websites[0]);
    }
  }, [websites, selectedWebsite]);

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error({ title: 'Error', description: 'You need to be logged in to update your profile' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      
      if (error) throw error;
      
      toast.success({ title: 'Success', description: 'Profile settings saved successfully' });
    } catch (error: any) {
      toast.error({ title: 'Error', description: error.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error({ title: 'Error', description: 'New passwords do not match' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success({ title: 'Success', description: 'Password changed successfully' });
    } catch (error: any) {
      toast.error({ title: 'Error', description: error.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="webhooks" disabled={!planDetails.webhooksEnabled}>
              Webhooks {!planDetails.webhooksEnabled && '(Upgrade Required)'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and email address.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        readOnly
                      />
                      <p className="text-sm text-muted-foreground">
                        To change your email, please contact support.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveProfile} 
                      className="bg-brand-600 hover:bg-brand-700"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleChangePassword} 
                      className="bg-brand-600 hover:bg-brand-700"
                      disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {changingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            {websites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Website Selection</CardTitle>
                  <CardDescription>
                    {websites.length === 1 
                      ? "Webhook configuration for your website" 
                      : "Choose which website you want to configure webhooks for"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {websites.map((website) => (
                      <Button
                        key={website.id}
                        variant={selectedWebsite?.id === website.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedWebsite(website)}
                      >
                        {website.name}
                      </Button>
                    ))}
                  </div>
                  {selectedWebsite && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Currently configuring webhooks for: <span className="font-medium text-foreground">{selectedWebsite.name}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {selectedWebsite ? (
              <WebhookSettings website={selectedWebsite} />
            ) : websites.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No Websites Available</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      You need to create a website before you can configure webhooks.
                    </p>
                    <Button
                      onClick={() => {
                        window.location.href = '/dashboard/websites';
                      }}
                      className="mt-4"
                    >
                      Create Website
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Select a Website</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please select a website above to configure its webhooks.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
