
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type PlanDetails = {
  websiteLimit: number;
  analyticsHistory: number;
  webhooksEnabled: boolean;
  whiteLabel: boolean;
  customization: 'basic' | 'standard' | 'full';
  supportLevel: 'community' | 'email' | 'priority';
};

type PlanType = 'free' | 'basic' | 'professional';

const planLimits: Record<PlanType, PlanDetails> = {
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

const usePlanLimits = () => {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<PlanType>('free');
  const [planDetails, setPlanDetails] = useState<PlanDetails>(planLimits.free);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setIsLoading(false);
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
        setPlanDetails(planLimits[plan]);
      } catch (err: any) {
        console.error('Error fetching user plan:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

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
    isLoading,
    error,
    checkWebsiteLimit,
    checkWebhookEnabled,
    checkWhiteLabelEnabled,
    getAnalyticsRetentionDays
  };
};

export default usePlanLimits;
