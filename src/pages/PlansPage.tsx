import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

// Define subscription plan types
type SubscriptionPlan = 'free' | 'basic' | 'professional';

// Define plan features and limits
const planDetails = {
  free: {
    name: 'Free',
    price: '$0',
    description: 'Basic features for personal use',
    features: [
      'Single website',
      '7-day analytics history',
      'Community support',
      'Basic customization'
    ],
    limits: {
      websiteLimit: 1,
      analyticsHistory: 7,
      webhooksEnabled: false,
      whiteLabel: false,
      customization: 'basic',
      supportLevel: 'community'
    },
    ctaText: 'Current Plan',
    disabled: true
  },
  basic: {
    name: 'Basic',
    price: '$9.99',
    description: 'Enhanced features for professionals',
    features: [
      'Up to 5 websites',
      '30-day analytics history',
      'Email support',
      'Standard customization',
      'Webhook integration'
    ],
    limits: {
      websiteLimit: 5,
      analyticsHistory: 30,
      webhooksEnabled: true,
      whiteLabel: false,
      customization: 'standard',
      supportLevel: 'email'
    },
    ctaText: 'Upgrade',
    disabled: false
  },
  professional: {
    name: 'Professional',
    price: '$29.99',
    description: 'Premium features for businesses',
    features: [
      'Up to 20 websites',
      '90-day analytics history',
      'Priority support',
      'Full customization',
      'Webhook integration',
      'White labeling'
    ],
    limits: {
      websiteLimit: 20,
      analyticsHistory: 90,
      webhooksEnabled: true,
      whiteLabel: true,
      customization: 'full',
      supportLevel: 'priority'
    },
    ctaText: 'Upgrade',
    disabled: false
  }
};

const PlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    free: false,
    basic: false,
    professional: false
  });

  // Fetch user's current plan when component mounts
  React.useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/user-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ 
            action: 'get_user_plan',
            userId: user.id 
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch user plan');
        }
        
        if (data.plan) {
          setCurrentPlan(data.plan as SubscriptionPlan);
        } else {
          setCurrentPlan('free');
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
        // Default to free plan if there's an error
        setCurrentPlan('free');
      }
    };
    
    fetchUserPlan();
  }, [user]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to select a plan'
      });
      return;
    }
    
    // Don't do anything if selecting the current plan
    if (plan === currentPlan) {
      toast.info('Plan Information', {
        description: `You are already on the ${planDetails[plan].name} plan`
      });
      return;
    }
    
    setIsLoading(prev => ({ ...prev, [plan]: true }));
    
    try {
      // For a real implementation, this would redirect to a payment page
      // For now, we'll just update the user's plan directly
      
      if (plan !== 'free') {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update user's plan using edge function
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/user-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ 
          action: 'update_user_plan',
          userId: user.id,
          plan: plan 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plan');
      }
      
      setCurrentPlan(plan);
      toast.success(`Plan Updated`, { 
        description: `Successfully ${plan === 'free' ? 'downgraded to' : 'upgraded to'} ${planDetails[plan].name} plan`
      });
      
    } catch (error: any) {
      toast.error('Update Failed', { 
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [plan]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground mt-2">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {(Object.keys(planDetails) as Array<SubscriptionPlan>).map((plan) => {
            const details = planDetails[plan];
            const isCurrentPlan = currentPlan === plan;
            
            return (
              <Card 
                key={plan}
                className={`border ${isCurrentPlan ? 'border-brand-500 shadow-md' : ''}`}
              >
                <CardHeader>
                  <CardTitle>{details.name}</CardTitle>
                  <CardDescription className="flex flex-col">
                    <span className="text-2xl font-bold mt-2">{details.price}</span>
                    <span className="text-sm">per month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{details.description}</p>
                  <ul className="space-y-2">
                    {details.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-brand-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${isCurrentPlan ? 'bg-brand-100 text-brand-800 hover:bg-brand-200' : 'bg-brand-600 hover:bg-brand-700'}`}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan || details.disabled || isLoading[plan]}
                  >
                    {isLoading[plan] ? 'Processing...' : isCurrentPlan ? 'Current Plan' : details.ctaText}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Plan Management Information</h3>
          <p className="text-sm text-muted-foreground">
            Your plan will be billed monthly. You can upgrade or downgrade your plan at any time.
            Changes to your plan will take effect immediately. For any billing questions, please
            contact our support team.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlansPage;
