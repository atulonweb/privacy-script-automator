
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

type SubscriptionPlan = 'free' | 'basic' | 'professional';

// Define the type for the userData returned from get_user_by_email RPC
interface UserData {
  id: string;
  email: string;
}

export function UserPlanManagement() {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [userFound, setUserFound] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);

  // Check if user exists when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (!email.includes('@')) return;
      
      try {
        // Call the get_user_by_email RPC function to find the user
        const { data: userData, error: userError } = await supabase
          .rpc('get_user_by_email', { user_email: email });
          
        if (userError) throw userError;
        
        if (userData) {
          // Safely check if userData has the expected structure before casting
          const userObj = userData as unknown;
          
          // Verify the structure matches our UserData interface
          if (
            typeof userObj === 'object' && 
            userObj !== null &&
            'id' in userObj && 
            'email' in userObj &&
            typeof userObj.id === 'string' &&
            typeof userObj.email === 'string'
          ) {
            const user = userObj as UserData;
            setUserFound(true);
            setUserId(user.id);
            
            // Fetch user's current plan using raw SQL query since the table isn't in the types yet
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .single();
              
            if (!subscriptionError && subscriptionData) {
              setSelectedPlan(subscriptionData.plan as SubscriptionPlan);
              setCurrentPlan(subscriptionData.plan as SubscriptionPlan);
            } else {
              setSelectedPlan('free');
              setCurrentPlan('free');
            }
          } else {
            console.error('Invalid user data structure:', userObj);
            setUserFound(false);
            setUserId(null);
            setCurrentPlan(null);
          }
        } else {
          setUserFound(false);
          setUserId(null);
          setCurrentPlan(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUserFound(false);
        setUserId(null);
        setCurrentPlan(null);
      }
    };
    
    if (email && email.includes('@')) {
      checkUser();
    } else {
      setUserFound(false);
      setUserId(null);
      setCurrentPlan(null);
    }
  }, [email]);

  const handleUpdatePlan = async () => {
    if (!userId) {
      toast.error('User not found');
      return;
    }
    
    if (selectedPlan === currentPlan) {
      toast.info(`${email} is already on the ${selectedPlan} plan`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the user's plan in the database using raw SQL query
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan: selectedPlan,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'  // Add this to handle conflict on user_id
        });
        
      if (error) throw error;
      
      setCurrentPlan(selectedPlan);
      toast.success(`Successfully updated ${email}'s plan to ${selectedPlan}`);
    } catch (error: any) {
      toast.error('Failed to update plan', { 
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage User Plans</CardTitle>
        <CardDescription>
          Update subscription plans for individual users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-email">User Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && !userFound && email.includes('@') && (
            <p className="text-sm text-red-500">User not found</p>
          )}
        </div>
        
        {userFound && (
          <>
            <div className="space-y-2">
              <Label htmlFor="plan-select">Subscription Plan</Label>
              <Select
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as SubscriptionPlan)}
              >
                <SelectTrigger id="plan-select">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic ($9.99/mo)</SelectItem>
                  <SelectItem value="professional">Professional ($29.99/mo)</SelectItem>
                </SelectContent>
              </Select>
              
              {currentPlan && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current plan: <span className="font-medium capitalize">{currentPlan}</span>
                </p>
              )}
            </div>
            
            <Button 
              className="w-full"
              onClick={handleUpdatePlan}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Plan'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
