import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import usePlanLimitNotifications from './usePlanLimitNotifications';

type PlanDetails = {
  websiteLimit: number;
  analyticsHistory: number;
  webhooksEnabled: boolean;
  whiteLabel: boolean;
  customization: 'basic' | 'standard' | 'full';
  supportLevel: 'community' | 'email' | 'priority';
};

type PlanType = 'free' | 'basic' | 'professional';

// Default fallback plan limits
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
    websiteLimit: 3,
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

const fetchPlanSettings = async (): Promise<Record<PlanType, PlanDetails>> => {
  const { data, error } = await supabase
    .from('plan_settings')
    .select('*');

  if (error) {
    console.error('Error fetching plan settings:', error);
    return defaultPlanLimits;
  }

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

const fetchUserSubscription = async (userId: string): Promise<PlanType> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user subscription:', error);
  }

  return (data?.plan as PlanType) || 'free';
};

const fetchUserWebsiteCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('websites')
    .select('id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching website count:', error);
    return 0;
  }
  
  return data?.length || 0;
};

const usePlanLimits = () => {
  const { user } = useAuth();
  const [planDetails, setPlanDetails] = useState<PlanDetails>(defaultPlanLimits.free);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { showOneTimeNotification } = usePlanLimitNotifications();

  const { data: planSettings, isLoading: planSettingsLoading } = useQuery({
    queryKey: ['planSettings'],
    queryFn: fetchPlanSettings,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { data: userPlan, isLoading: userPlanLoading, refetch: refetchUserPlan } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: () => fetchUserSubscription(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  const { data: websiteCount, refetch: refetchWebsiteCount } = useQuery({
    queryKey: ['userWebsiteCount', user?.id],
    queryFn: () => fetchUserWebsiteCount(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const currentPlan = userPlan || 'free';
  const isLoading = planSettingsLoading || userPlanLoading;

  useEffect(() => {
    if (planSettings && currentPlan) {
      setPlanDetails(planSettings[currentPlan]);
      setError(null);
    }
  }, [planSettings, currentPlan]);

  const refreshUserPlan = async () => {
    try {
      await Promise.all([
        refetchUserPlan(),
        refetchWebsiteCount(),
        queryClient.invalidateQueries({ queryKey: ['planSettings'] })
      ]);
    } catch (err: any) {
      console.error('Error refreshing user plan:', err);
      setError(err.message);
    }
  };

  // Comprehensive plan limit enforcement
  const enforcePlanLimits = {
    canCreateWebsite: async (): Promise<boolean> => {
      if (!user || !planDetails) return false;

      try {
        await refetchWebsiteCount();
        const currentCount = websiteCount || 0;
        
        if (currentCount >= planDetails.websiteLimit) {
          showOneTimeNotification(
            'feature_restricted',
            'Website Limit Reached',
            `Your ${currentPlan} plan allows a maximum of ${planDetails.websiteLimit} websites. You currently have ${currentCount}. Please upgrade to add more websites.`,
            'error',
            'website_limit'
          );
          return false;
        }
        
        return true;
      } catch (err) {
        console.error('Error checking website limits:', err);
        return false;
      }
    },

    canUseWebhooks: (): boolean => {
      if (!planDetails.webhooksEnabled) {
        showOneTimeNotification(
          'feature_restricted',
          'Feature Not Available',
          `Webhooks are not available on your ${currentPlan} plan. Please upgrade to use webhooks.`,
          'error',
          'webhooks'
        );
        return false;
      }
      return true;
    },

    canUseWhiteLabel: (): boolean => {
      if (!planDetails.whiteLabel) {
        showOneTimeNotification(
          'feature_restricted',
          'Feature Not Available',
          `White labeling is not available on your ${currentPlan} plan. Please upgrade to remove branding.`,
          'error',
          'white_label'
        );
        return false;
      }
      return true;
    },

    getAnalyticsRetention: (): number => {
      return planDetails.analyticsHistory;
    },

    isOverWebsiteLimit: (): boolean => {
      const currentCount = websiteCount || 0;
      return currentCount > planDetails.websiteLimit;
    },

    getCurrentUsage: () => ({
      websites: websiteCount || 0,
      websiteLimit: planDetails.websiteLimit,
      isOverLimit: (websiteCount || 0) > planDetails.websiteLimit
    }),

    // Make sure this is only called on dashboard page with showOnDashboard=true
    enforceAllLimits: (showOnDashboard: boolean = false) => {
      // Only proceed if we're explicitly showing on dashboard
      if (!showOnDashboard) {
        return true; // Skip notification on non-dashboard pages
      }

      const currentCount = websiteCount || 0;
      const violations = [];

      if (currentCount > planDetails.websiteLimit) {
        violations.push(`You have ${currentCount} websites but your ${currentPlan} plan only allows ${planDetails.websiteLimit}`);
      }

      if (violations.length > 0) {
        showOneTimeNotification(
          'plan_limit_exceeded',
          'Plan Limits Exceeded',
          violations.join('. ') + '. Please upgrade your plan or remove excess items.',
          'error',
          'dashboard'
        );
      }

      return violations.length === 0;
    }
  };

  return {
    userPlan: currentPlan,
    planDetails,
    isLoading,
    error,
    refreshUserPlan,
    enforcePlanLimits,
    websiteCount: websiteCount || 0,
    // Legacy methods for backward compatibility
    checkWebsiteLimit: enforcePlanLimits.canCreateWebsite,
    checkWebhookEnabled: enforcePlanLimits.canUseWebhooks,
    checkWhiteLabelEnabled: enforcePlanLimits.canUseWhiteLabel,
    getAnalyticsRetentionDays: enforcePlanLimits.getAnalyticsRetention
  };
};

export default usePlanLimits;
