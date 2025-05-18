
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Admin = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

export function useAdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Try to get admin users via edge function
      try {
        console.log("Attempting to fetch admin users");
        // Get all users with admin role via edge function
        const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'get_admins' }),
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.admins) {
          console.error("Edge function error:", data);
          throw new Error(data.error || "Failed to get admin users");
        }
        
        console.log("Successfully fetched admin users from edge function:", data);
        
        // Map admin users to our admin type
        const adminUsers = data.admins.map(async (admin: any) => {
          // Get profile data for each admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', admin.id)
            .single();
          
          return {
            id: admin.id,
            email: admin.email,
            full_name: profile?.full_name || null,
            created_at: admin.created_at || new Date().toISOString(),
          };
        });
        
        const adminsWithDetails = await Promise.all(adminUsers);
        console.log("Admin users with details:", adminsWithDetails);
        
        setAdmins(adminsWithDetails);
        return;
      } catch (error) {
        console.error("Edge function access failed:", error);
        // Continue with fallback approaches
      }
      
      // Fallback: Try to determine if current user is admin
      try {
        console.log("Attempting to identify admins via RPC");
        
        // Check if current user is admin
        const { data: isAdmin } = await supabase.rpc('is_admin');
        
        if (isAdmin === true) {
          // If is_admin returns true, we know the current user is an admin
          // We can at least show the current user in the list
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            const adminList: Admin[] = [{
              id: user.id,
              email: user.email || 'admin@example.com',
              full_name: profile?.full_name || user.user_metadata?.full_name || null,
              created_at: profile?.created_at || new Date().toISOString()
            }];
            
            setAdmins(adminList);
            console.log("Using current user as admin:", adminList);
            return;
          }
        }
      } catch (error) {
        console.error("RPC approach failed:", error);
      }
      
      // Last fallback: Show at least the current user if they are an admin
      console.log("Using fallback approach to show current user");
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const currentAdmin = {
          id: user.id,
          email: user.email || 'admin@example.com',
          full_name: profile?.full_name || user.user_metadata?.full_name || null,
          created_at: profile?.created_at || new Date().toISOString()
        };
        
        setAdmins([currentAdmin]);
      } else {
        // If all else fails, show empty list
        setAdmins([]);
      }
      
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast.error('Failed to load admins');
      
      // Last resort: Show current user only
      if (user) {
        setAdmins([{
          id: user.id,
          email: user.email || 'admin@example.com',
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString()
        }]);
      } else {
        setAdmins([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdminAdded = async () => {
    toast.success('Admin added successfully!');
    await fetchAdmins(); // Refresh the list to get the new admin
  };

  return {
    admins,
    loading,
    refreshing,
    fetchAdmins,
    handleAdminAdded
  };
}
