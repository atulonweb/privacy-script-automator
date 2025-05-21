
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

type PlanDetails = {
  websiteLimit: number;
  analyticsHistory: number;
  webhooksEnabled: boolean;
  whiteLabel: boolean;
  customization: 'basic' | 'standard' | 'full';
  supportLevel: 'community' | 'email' | 'priority';
};

type PlanType = 'free' | 'basic' | 'professional';

// Default fallback plan limits in case database fetch fails
const defaultPlanLimits: Record<PlanType, PlanDetails> = {
  free: {
    websiteLimit: 1,
    analyticsHistory: 7,
    webhooksEnabled: false,
    whiteLabel: false,
    customization: 'basic',
    supportLevel: 'community'
  },
  basic: {
    websiteLimit: 5,
    analyticsHistory: 30,
    webhooksEnabled: true,
    whiteLabel: false,
    customization: 'standard',
    supportLevel: 'email'
  },
  professional: {
    websiteLimit: 20,
    analyticsHistory: 90,
    webhooksEnabled: true,
    whiteLabel: true,
    customization: 'full',
    supportLevel: 'priority'
  }
};

// Function to fetch all plan settings from the database
const fetchPlanSettings = async (): Promise<Record<PlanType, PlanDetails>> => {
  const { data, error } = await supabase
    .from('plan_settings')
    .select('*');

  if (error) {
    console.error('Error fetching plan settings:', error);
    throw error;
  }

  // Convert the database results to the format our application uses
  const planSettings: Record<PlanType, PlanDetails> = { ...defaultPlanLimits };

  data.forEach((plan) => {
    const planType = plan.plan_type as PlanType;
    planSettings[planType] = {
      websiteLimit: plan.website_limit,
      analyticsHistory: plan.analytics_history,
      webhooksEnabled: plan.webhooks_enabled,
      whiteLabel: plan.white_label,
      customization: plan.customization as 'basic' | 'standard' | 'full',
      supportLevel: plan.support_level as 'community' | 'email' | 'priority'
    };
  });

  return planSettings;
};

const usePlanLimits = () => {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<PlanType>('free');
  const [planDetails, setPlanDetails] = useState<PlanDetails>(defaultPlanLimits.free);
  const [error, setError] = useState<string | null>(null);

  // Fetch plan settings with react-query for caching
  const { data: planSettings } = useQuery({
    queryKey: ['planSettings'],
    queryFn: fetchPlanSettings,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    // If the fetch fails, use the default values
    onError: (err) => {
      console.error('Failed to fetch plan settings:', err);
    }
  });

  // Fetch user's current subscription plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }

        const plan = (data?.plan as PlanType) || 'free';
        setUserPlan(plan);
        
        // Use the fetched plan settings or fall back to defaults if not available
        const currentPlanSettings = planSettings || defaultPlanLimits;
        setPlanDetails(currentPlanSettings[plan]);
      } catch (err: any) {
        console.error('Error fetching user plan:', err);
        setError(err.message);
        // Fall back to default limits for the user's plan
        setPlanDetails(defaultPlanLimits[userPlan]);
      }
    };

    fetchUserPlan();
  }, [user, planSettings]);

  // Update plan details whenever planSettings changes
  useEffect(() => {
    if (planSettings && userPlan) {
      setPlanDetails(planSettings[userPlan]);
    }
  }, [planSettings, userPlan]);

  const checkWebsiteLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: websites, error } = await supabase
        .from('websites')
        .select('id')
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;

      const currentCount = websites?.length || 0;
      
      if (currentCount >= planDetails.websiteLimit) {
        toast.warning('Plan Limit Reached', { 
          description: `Your ${userPlan} plan allows a maximum of ${planDetails.websiteLimit} websites. Please upgrade to add more websites.`
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error checking website limits:', err);
      return false;
    }
  };

  const checkWebhookEnabled = (): boolean => {
    if (!planDetails.webhooksEnabled) {
      toast.warning('Feature Not Available', { 
        description: `Webhooks are not available on your ${userPlan} plan. Please upgrade to use webhooks.`
      });
      return false;
    }
    return true;
  };

  const checkWhiteLabelEnabled = (): boolean => {
    if (!planDetails.whiteLabel) {
      toast.warning('Feature Not Available', { 
        description: `White labeling is not available on your ${userPlan} plan. Please upgrade to remove branding.`
      });
      return false;
    }
    return true;
  };

  const getAnalyticsRetentionDays = (): number => {
    return planDetails.analyticsHistory;
  };

  return {
    userPlan,
    planDetails,
    isLoading: !planSettings,
    error,
    checkWebsiteLimit,
    checkWebhookEnabled,
    checkWhiteLabelEnabled,
    getAnalyticsRetentionDays
  };
};

export default usePlanLimits;
