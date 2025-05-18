
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Website } from '@/components/admin/UserWebsitesTable';
import { Script } from '@/components/admin/UserScriptsTable';
import { Webhook } from '@/types/webhook.types';

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export function useUserDetails(userId: string | undefined) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setFetchError(null);
    setIsRefreshing(true);
    
    try {
      console.log("Fetching details for user ID:", userId);
      
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
      
      const userDetails: UserDetails = {
        id: userId,
        email: userData.email,
        full_name: profileData.full_name,
        role: userData.role || 'user',
        created_at: profileData.created_at
      };
      
      setUserDetails(userDetails);
      
      // Fetch user's websites
      const { data: websitesData, error: websitesError } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userId);
      
      if (websitesError) throw websitesError;
      console.log("Fetched websites:", websitesData);
      setWebsites(websitesData || []);
      
      // Fetch user's scripts
      const { data: scriptsData, error: scriptsError } = await supabase
        .from('consent_scripts')
        .select('*')
        .eq('user_id', userId);
      
      if (scriptsError) throw scriptsError;
      console.log("Fetched scripts:", scriptsData);
      setScripts(scriptsData || []);
      
      // Fetch user's webhooks - making a dedicated call to ensure we get ALL webhooks
      console.log("Fetching webhooks for user ID:", userId);
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (webhooksError) {
        console.error("Error fetching webhooks:", webhooksError);
        throw webhooksError;
      }
      
      console.log("Fetched webhooks data:", webhooksData);
      
      if (webhooksData && webhooksData.length > 0) {
        console.log(`Found ${webhooksData.length} webhooks for user ${userId}:`);
        webhooksData.forEach(webhook => {
          console.log(`- Webhook ID: ${webhook.id}, URL: ${webhook.url}, Enabled: ${webhook.enabled}`);
        });
        setWebhooks(webhooksData as Webhook[]);
      } else {
        console.log(`No webhooks found for user ${userId}`);
        setWebhooks([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setFetchError(error.message);
      toast.error(`Failed to load user details: ${error.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  return {
    userDetails,
    websites,
    scripts,
    webhooks,
    loading,
    fetchError,
    isRefreshing,
    fetchUserDetails
  };
}
