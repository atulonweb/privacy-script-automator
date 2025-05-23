
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [userToUpdatePlan, setUserToUpdatePlan] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      setUpdatingPlan(true);
      setUserToUpdatePlan(userId);
      
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">All Users ({users.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Free
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => updateUserPlan(user.id, 'pro')}
                        disabled={updatingPlan}
                        className="text-brand-600 hover:text-brand-900 disabled:opacity-50"
                      >
                        {updatingPlan && userToUpdatePlan === user.id ? 'Updating...' : 'Update Plan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
