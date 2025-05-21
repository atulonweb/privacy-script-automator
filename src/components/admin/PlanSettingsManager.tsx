
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

type PlanSetting = {
  id: string;
  plan_type: 'free' | 'basic' | 'professional';
  website_limit: number;
  analytics_history: number;
  webhooks_enabled: boolean;
  white_label: boolean;
  customization: 'basic' | 'standard' | 'full';
  support_level: 'community' | 'email' | 'priority';
};

const PlanSettingsManager = () => {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Partial<PlanSetting>>({});

  // Fetch plan settings
  const { data: planSettings, isLoading, error } = useQuery({
    queryKey: ['adminPlanSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_settings')
        .select('*')
        .order('plan_type');

      if (error) throw error;
      return data as PlanSetting[];
    }
  });

  // Update plan settings mutation
  const updatePlanMutation = useMutation({
    mutationFn: async (plan: Partial<PlanSetting>) => {
      const { data, error } = await supabase
        .from('plan_settings')
        .update({
          website_limit: plan.website_limit,
          analytics_history: plan.analytics_history,
          webhooks_enabled: plan.webhooks_enabled,
          white_label: plan.white_label,
          customization: plan.customization,
          support_level: plan.support_level
        })
        .eq('id', plan.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Plan settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminPlanSettings'] });
      queryClient.invalidateQueries({ queryKey: ['planSettings'] });
      setEditingPlan(null);
      setFormValues({});
    },
    onError: (error) => {
      toast.error(`Failed to update plan settings: ${error.message}`);
    }
  });

  const handleEdit = (plan: PlanSetting) => {
    setEditingPlan(plan.id);
    setFormValues(plan);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setFormValues({});
  };

  const handleSave = () => {
    if (editingPlan && formValues) {
      updatePlanMutation.mutate({ ...formValues, id: editingPlan });
    }
  };

  const handleInputChange = (field: keyof PlanSetting, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-500">Error loading plan settings: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Plan Settings Management</h2>
      <p className="text-muted-foreground">
        Customize the limits and features available for each subscription plan.
      </p>

      {planSettings?.map((plan) => (
        <Card key={plan.id} className="mb-4">
          <CardHeader>
            <CardTitle className="capitalize">{plan.plan_type} Plan</CardTitle>
            <CardDescription>
              Configure limits and features for the {plan.plan_type} tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editingPlan === plan.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`website-limit-${plan.id}`}>Website Limit</Label>
                    <Input
                      id={`website-limit-${plan.id}`}
                      type="number"
                      value={formValues.website_limit}
                      onChange={(e) => handleInputChange('website_limit', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`analytics-history-${plan.id}`}>Analytics History (days)</Label>
                    <Input
                      id={`analytics-history-${plan.id}`}
                      type="number"
                      value={formValues.analytics_history}
                      onChange={(e) => handleInputChange('analytics_history', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`webhooks-enabled-${plan.id}`}
                      checked={formValues.webhooks_enabled}
                      onCheckedChange={(checked) => handleInputChange('webhooks_enabled', checked)}
                    />
                    <Label htmlFor={`webhooks-enabled-${plan.id}`}>Webhooks Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`white-label-${plan.id}`}
                      checked={formValues.white_label}
                      onCheckedChange={(checked) => handleInputChange('white_label', checked)}
                    />
                    <Label htmlFor={`white-label-${plan.id}`}>White Label</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`customization-${plan.id}`}>Customization Level</Label>
                    <Select
                      value={formValues.customization}
                      onValueChange={(value) => handleInputChange('customization', value)}
                    >
                      <SelectTrigger id={`customization-${plan.id}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`support-level-${plan.id}`}>Support Level</Label>
                    <Select
                      value={formValues.support_level}
                      onValueChange={(value) => handleInputChange('support_level', value)}
                    >
                      <SelectTrigger id={`support-level-${plan.id}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website Limit</p>
                    <p className="text-lg">{plan.website_limit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Analytics History</p>
                    <p className="text-lg">{plan.analytics_history} days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Webhooks</p>
                    <p className="text-lg">{plan.webhooks_enabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">White Label</p>
                    <p className="text-lg">{plan.white_label ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Customization</p>
                    <p className="text-lg capitalize">{plan.customization}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Support Level</p>
                    <p className="text-lg capitalize">{plan.support_level}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            {editingPlan === plan.id ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updatePlanMutation.isPending}>
                  {updatePlanMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => handleEdit(plan)}>Edit Settings</Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PlanSettingsManager;
