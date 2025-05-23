
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import usePlanLimits from '@/hooks/usePlanLimits';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhiteLabelConfig {
  id?: string;
  user_id: string;
  company_name: string;
  company_logo_url: string;
  primary_color: string;
  secondary_color: string;
  custom_domain: string;
  remove_branding: boolean;
  custom_footer_text: string;
  contact_email: string;
  privacy_policy_url: string;
  terms_of_service_url: string;
  created_at?: string;
  updated_at?: string;
}

const WhiteLabelSettings: React.FC = () => {
  const { user } = useAuth();
  const { enforcePlanLimits, userPlan } = usePlanLimits();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<WhiteLabelConfig>({
    user_id: user?.id || '',
    company_name: '',
    company_logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    custom_domain: '',
    remove_branding: false,
    custom_footer_text: '',
    contact_email: '',
    privacy_policy_url: '',
    terms_of_service_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchWhiteLabelConfig();
    }
  }, [user]);

  const fetchWhiteLabelConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('white_label_configs')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (err: any) {
      console.error('Error fetching white label config:', err);
      toast.error('Failed to load white label settings');
    } finally {
      setLoading(false);
    }
  };

  const saveWhiteLabelConfig = async () => {
    if (!enforcePlanLimits.canUseWhiteLabel()) {
      return;
    }

    try {
      setSaving(true);
      
      const configData = {
        ...config,
        user_id: user!.id,
        updated_at: new Date().toISOString()
      };

      if (config.id) {
        // Update existing config
        const { error } = await supabase
          .from('white_label_configs')
          .update(configData)
          .eq('id', config.id)
          .eq('user_id', user!.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('white_label_configs')
          .insert([{
            ...configData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast.success('White label settings saved successfully');
    } catch (err: any) {
      console.error('Error saving white label config:', err);
      toast.error('Failed to save white label settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WhiteLabelConfig, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!enforcePlanLimits.canUseWhiteLabel()) {
    return (
      <div className="space-y-6">
        <Alert className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Feature Not Available:</strong> White labeling is not available on your {userPlan} plan. 
            Please upgrade to access white labeling features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>White Label Configuration</CardTitle>
          <CardDescription>
            Customize the branding and appearance of your consent scripts to match your company's identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={config.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contact@yourcompany.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_logo_url">Company Logo URL</Label>
            <Input
              id="company_logo_url"
              value={config.company_logo_url}
              onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
            />
          </div>

          {/* Color Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={config.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={config.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={config.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={config.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Domain and Branding */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom_domain">Custom Domain (Optional)</Label>
              <Input
                id="custom_domain"
                value={config.custom_domain}
                onChange={(e) => handleInputChange('custom_domain', e.target.value)}
                placeholder="scripts.yourcompany.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="remove_branding"
                checked={config.remove_branding}
                onCheckedChange={(checked) => handleInputChange('remove_branding', checked)}
              />
              <Label htmlFor="remove_branding">Remove "Powered by ConsentGuard" Branding</Label>
            </div>
          </div>

          {/* Legal Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="privacy_policy_url">Privacy Policy URL</Label>
              <Input
                id="privacy_policy_url"
                value={config.privacy_policy_url}
                onChange={(e) => handleInputChange('privacy_policy_url', e.target.value)}
                placeholder="https://yourcompany.com/privacy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms_of_service_url">Terms of Service URL</Label>
              <Input
                id="terms_of_service_url"
                value={config.terms_of_service_url}
                onChange={(e) => handleInputChange('terms_of_service_url', e.target.value)}
                placeholder="https://yourcompany.com/terms"
              />
            </div>
          </div>

          {/* Custom Footer Text */}
          <div className="space-y-2">
            <Label htmlFor="custom_footer_text">Custom Footer Text</Label>
            <Textarea
              id="custom_footer_text"
              value={config.custom_footer_text}
              onChange={(e) => handleInputChange('custom_footer_text', e.target.value)}
              placeholder="Additional text to display in the consent banner footer"
              rows={3}
            />
          </div>

          <Button
            onClick={saveWhiteLabelConfig}
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700"
          >
            {saving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save White Label Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhiteLabelSettings;
