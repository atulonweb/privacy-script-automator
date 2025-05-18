
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export function useFetchUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      console.log("Fetched profile data:", profileData);

      // Try to get user data via edge function (requires admin privileges)
      let userData = null;
      
      try {
        // Attempt to get user data from edge function
        const response = await fetch(`https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'get_user', userId }),
        });
        
        const responseData = await response.json();
        
        if (response.ok && responseData.user) {
          userData = responseData.user;
          console.log("Edge function returned user data:", userData);
        } else {
          console.error("Edge function error response:", responseData);
          throw new Error(responseData.error || "Failed to get user data from edge function");
        }
      } catch (error) {
        console.error('Edge function error:', error);
        // Continue with fallback approach
      }
      
      // If we couldn't get user data from edge function, fallback to the profile with placeholders
      if (!userData) {
        console.log('Using fallback user data approach');
        // Try to get email directly from auth.users if admin (this may or may not work depending on permissions)
        let userEmail = '';
        try {
          // Check if user is admin
          const { data: isAdmin } = await supabase.rpc('is_admin');
          
          if (isAdmin === true) {
            try {
              // Make a direct API call to get the user's email
              const response = await fetch(`https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
                body: JSON.stringify({ action: 'get_user_email', userId }),
              });
              
              const data = await response.json();
              if (data && data.email) {
                userEmail = data.email;
                console.log("Retrieved email via API call:", userEmail);
              }
            } catch (e) {
              console.log("Could not get email via API call:", e);
            }
          }
        } catch (e) {
          console.log("Could not verify admin status:", e);
        }
        
        // Use fallback email if needed
        if (!userEmail) {
          userEmail = `user-${userId.substring(0, 6)}@example.com`;
          console.log("Using fallback email:", userEmail);
        }
        
        userData = {
          email: userEmail,
          role: 'user',
          created_at: profileData.created_at
        };
      }
      
      const userDetails: UserProfile = {
        id: userId,
        email: userData.email,
        full_name: profileData.full_name,
        role: userData.role || 'user',
        created_at: profileData.created_at
      };
      
      return userDetails;
      
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      toast.error(`Failed to load user profile: ${error.message}`);
      throw error;
    }
  };
  
  return {
    userProfile,
    setUserProfile,
    fetchUserProfile
  };
}
