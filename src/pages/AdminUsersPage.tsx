
  // This is a partial update to the updateUserPlan function in AdminUsersPage.tsx
  // Replace just this function with the version below
  
  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      setUpdatingPlan(true);
      
      console.log('Updating plan for user:', userId, 'to plan:', plan);
      
      try {
        // Call edge function to update the plan with admin privileges
        const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ userId, plan }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error("Edge function error:", data);
          throw new Error(data.error || 'Failed to update subscription plan');
        }
        
        console.log('Edge function response:', data);
        toast.success(`Successfully updated user's plan to ${plan}`);
      } catch (edgeError: any) {
        console.error("Edge function call failed:", edgeError);
        
        // Fallback to direct database update if edge function fails
        console.log("Falling back to direct database update");
        
        // First check if subscription exists
        const { data: existingSubscription, error: checkError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
        
        if (!existingSubscription) {
          // Insert new subscription
          const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan: plan,
              updated_at: new Date().toISOString()
            });
            
          if (insertError) throw insertError;
        } else {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              plan: plan,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) throw updateError;
        }
        
        toast.success(`Successfully updated user's plan to ${plan}`);
      }
      
      // Refresh the entire users list to get the latest data
      await fetchUsers();
      
    } catch (error: any) {
      console.error("Error updating user plan:", error);
      toast.error('Failed to update plan', { 
        description: error.message || 'Please try again later'
      });
    } finally {
      setUpdatingPlan(false);
      setUserToUpdatePlan(null);
    }
  };
