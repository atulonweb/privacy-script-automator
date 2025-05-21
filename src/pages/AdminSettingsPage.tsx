
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminsList } from '@/components/admin/AdminsList';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { CustomizeDialog } from '@/components/ui/customize-dialog';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import PlanSettingsManager from '@/components/admin/PlanSettingsManager';

const AdminSettingsPage = () => {
  const [defaultLanguage, setDefaultLanguage] = useState<string>('en');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const { admins, loading, fetchAdmins } = useAdminManagement();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(false);
  const { user } = useAuth();
  
  const [scriptSettings, setScriptSettings] = useState({
    analytics: true,
    advertising: false,
    functional: true,
    social: false,
    scripts: {
      analytics: [],
      advertising: [],
      functional: [],
      social: []
    }
  });
  
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' }
  ];

  const handleSaveGeneralSettings = () => {
    setSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success('General settings saved successfully!');
      setSubmitting(false);
    }, 500);
  };

  const handleSaveScriptSettings = (settings) => {
    setScriptSettings(settings);
    toast.success('Script settings saved successfully!');
    setConfigDialogOpen(false);
  };

  const handleToggleWhiteLabel = (checked) => {
    setWhiteLabelEnabled(checked);
    toast.success('White label setting updated');
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Settings</h2>
          
          <Link to="/admin/plans" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md">
            Manage User Plans
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="scripts">Script Config</TabsTrigger>
            <TabsTrigger value="permissions">User Permissions</TabsTrigger>
            <TabsTrigger value="plan">Plan Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select 
                    value={defaultLanguage} 
                    onValueChange={setDefaultLanguage}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="white-label">White Label (Remove "Powered by" branding)</Label>
                    <Switch 
                      id="white-label" 
                      checked={whiteLabelEnabled} 
                      onCheckedChange={handleToggleWhiteLabel}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneralSettings} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Script Configuration</CardTitle>
                <CardDescription>
                  Configure the default settings for consent scripts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Current Configuration</h3>
                  
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cookie Categories</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${scriptSettings.analytics ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Analytics: {scriptSettings.analytics ? 'Enabled' : 'Disabled'}
                          </li>
                          <li className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${scriptSettings.advertising ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Advertising: {scriptSettings.advertising ? 'Enabled' : 'Disabled'}
                          </li>
                          <li className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${scriptSettings.functional ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Functional: {scriptSettings.functional ? 'Enabled' : 'Disabled'}
                          </li>
                          <li className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${scriptSettings.social ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Social: {scriptSettings.social ? 'Enabled' : 'Disabled'}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Scripts Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                          {Object.values(scriptSettings.scripts).flat().length} script(s) configured
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click "Configure Scripts" to view and edit
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setConfigDialogOpen(true)}>
                  Configure Scripts
                </Button>
              </CardFooter>
            </Card>

            {/* Script configuration dialog */}
            <CustomizeDialog
              open={configDialogOpen}
              onOpenChange={setConfigDialogOpen}
              onSave={handleSaveScriptSettings}
              initialSettings={scriptSettings}
            />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4 pt-4">
            <AdminsList admins={admins} loading={loading} onRefresh={fetchAdmins} />
          </TabsContent>
          
          <TabsContent value="plan" className="space-y-4 pt-4">
            <PlanSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
