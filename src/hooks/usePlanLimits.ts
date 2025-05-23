
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

// Function to fetch user's current subscription plan
const fetchUserSubscription = async (userId: string): Promise<PlanType> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    throw error;
  }

  return (data?.plan as PlanType) || 'free';
};

// Function to get current website count for user
const fetchUserWebsiteCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('websites')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true);

  if (error) throw error;
  
  return data?.length || 0;
};

const usePlanLimits = () => {
  const { user } = useAuth();
  const [planDetails, setPlanDetails] = useState<PlanDetails>(defaultPlanLimits.free);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch plan settings with react-query for caching and real-time updates
  const { data: planSettings, isLoading: planSettingsLoading } = useQuery({
    queryKey: ['planSettings'],
    queryFn: fetchPlanSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch user's current subscription plan with react-query
  const { data: userPlan, isLoading: userPlanLoading, refetch: refetchUserPlan } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: () => fetchUserSubscription(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes (shorter for more real-time updates)
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: (failureCount, error: any) => {
      // Don't retry on "no rows returned" error
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });

  // Fetch user's current website count
  const { data: websiteCount, refetch: refetchWebsiteCount } = useQuery({
    queryKey: ['userWebsiteCount', user?.id],
    queryFn: () => fetchUserWebsiteCount(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // Cache for 30 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  const currentPlan = userPlan || 'free';
  const isLoading = planSettingsLoading || userPlanLoading;

  // Update plan details whenever planSettings or userPlan changes
  useEffect(() => {
    if (planSettings && currentPlan) {
      setPlanDetails(planSettings[currentPlan]);
      setError(null);
    }
  }, [planSettings, currentPlan]);

  // Function to refresh user plan data (useful after plan updates)
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

  const checkWebsiteLimit = async (): Promise<boolean> => {
    if (!user || !planDetails) return false;

    try {
      // Get fresh website count
      await refetchWebsiteCount();
      const currentCount = websiteCount || 0;
      
      console.log('Plan limit check:', {
        currentPlan,
        websiteLimit: planDetails.websiteLimit,
        currentCount,
        canAdd: currentCount < planDetails.websiteLimit
      });
      
      if (currentCount >= planDetails.websiteLimit) {
        toast.warning('Plan Limit Reached', { 
          description: `Your ${currentPlan} plan allows a maximum of ${planDetails.websiteLimit} websites. You currently have ${currentCount}. Please upgrade to add more websites.`
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
        description: `Webhooks are not available on your ${currentPlan} plan. Please upgrade to use webhooks.`
      });
      return false;
    }
    return true;
  };

  const checkWhiteLabelEnabled = (): boolean => {
    if (!planDetails.whiteLabel) {
      toast.warning('Feature Not Available', { 
        description: `White labeling is not available on your ${currentPlan} plan. Please upgrade to remove branding.`
      });
      return false;
    }
    return true;
  };

  const getAnalyticsRetentionDays = (): number => {
    return planDetails.analyticsHistory;
  };

  // Real-time plan limit enforcement
  const enforcePlanLimits = {
    // Check if user can create a new website
    canCreateWebsite: async (): Promise<boolean> => {
      return await checkWebsiteLimit();
    },
    
    // Check if user can use webhooks
    canUseWebhooks: (): boolean => {
      return checkWebhookEnabled();
    },
    
    // Check if user can use white label features
    canUseWhiteLabel: (): boolean => {
      return checkWhiteLabelEnabled();
    },
    
    // Get the analytics retention period
    getAnalyticsRetention: (): number => {
      return getAnalyticsRetentionDays();
    },

    // Get current usage stats
    getCurrentUsage: () => ({
      websites: websiteCount || 0,
      websiteLimit: planDetails.websiteLimit
    })
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
    checkWebsiteLimit,
    checkWebhookEnabled,
    checkWhiteLabelEnabled,
    getAnalyticsRetentionDays
  };
};

export default usePlanLimits;
