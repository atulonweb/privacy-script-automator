
/*
 * ADMIN PAGE CODING STANDARDS:
 * 
 * 🚨 EDGE FUNCTION FIRST APPROACH 🚨
 * - NEVER make direct database queries from admin pages
 * - ALL admin data must come from edge functions
 * - Edge functions use service role key to bypass RLS
 * - This prevents permission errors and ensures proper security
 * 
 * 🚨 DATA CONSISTENCY STANDARDS 🚨
 * - Use optimistic updates for immediate UI feedback
 * - Pattern: Update local state → Call API → Refresh data on success
 * - Always revert local changes if API calls fail
 * - Invalidate relevant caches after successful operations
 * - Show loading states during operations
 * - Handle errors gracefully with user feedback
 * 
 * PATTERN TO FOLLOW:
 * 1. Create edge function actions for all data needs
 * 2. Use single edge function calls to get complete data
 * 3. Process data client-side only for UI formatting
 * 4. Keep frontend logic minimal and focused on presentation
 * 5. Implement optimistic updates for all data modifications
 */

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [userToUpdatePlan, setUserToUpdatePlan] = useState<{userId: string, name: string, currentPlan: string} | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchCompleteData();
  }, []);

  const fetchCompleteData = async () => {
    setLoading(true);
    try {
      console.log('Fetching complete admin data using edge functions only');
      
      // Fetch complete user data using edge function
      const usersResponse = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ action: 'get_users_complete' }),
      });

      const usersData = await usersResponse.json();
      
      if (!usersResponse.ok) {
        throw new Error(usersData.error || 'Failed to fetch users');
      }

      console.log('Users data:', usersData);
      setUsers(usersData.users || []);

      // Fetch available plans using edge function
      const plansResponse = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ action: 'get_plans' }),
      });

      const plansData = await plansResponse.json();
      
      if (!plansResponse.ok) {
        throw new Error(plansData.error || 'Failed to fetch plans');
      }

      console.log('Plans data:', plansData);
      setAvailablePlans(plansData.plans || []);

    } catch (error: any) {
      console.error("Error fetching complete admin data:", error);
      toast.error('Failed to fetch admin data', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update user in local state (optimistic updates)
  const updateUserInLocalState = (userId: string, updates: Partial<any>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  // Helper function to revert user state (on error)
  const revertUserState = (userId: string, originalData: any) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...originalData } : user
      )
    );
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    // Find the current user data for potential revert
    const currentUser = users.find(user => user.id === userId);
    const originalPlan = currentUser?.plan;
    
    try {
      setUpdatingPlan(true);
      
      console.log('Updating plan for user:', userId, 'to plan:', plan);
      
      // OPTIMISTIC UPDATE: Immediately update the UI
      updateUserInLocalState(userId, { plan });
      
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
        // Revert the optimistic update on error
        revertUserState(userId, { plan: originalPlan });
        throw new Error(data.error || 'Failed to update subscription plan');
      }
      
      console.log('Edge function response:', data);
      toast.success(`Successfully updated user's plan to ${plan}`);
      
      // Invalidate plan limits cache for real-time updates
      await queryClient.invalidateQueries({ queryKey: ['planSettings'] });
      await queryClient.invalidateQueries({ queryKey: ['userSubscription'] });
      
      // Refresh the complete data to ensure consistency
      await fetchCompleteData();
      
    } catch (error: any) {
      console.error("Error updating user plan:", error);
      
      // Revert optimistic update on error
      if (originalPlan) {
        revertUserState(userId, { plan: originalPlan });
      }
      
      toast.error('Failed to update plan', { 
        description: error.message || 'Please try again later'
      });
    } finally {
      setUpdatingPlan(false);
      setUserToUpdatePlan(null);
    }
  };
  
  const viewUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const renderPlanBadge = (plan: string) => {
    switch (plan) {
      case 'professional':
        return <Badge className="bg-purple-500">Professional</Badge>;
      case 'basic':
        return <Badge className="bg-blue-600">Basic</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-500">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      case 'super_admin':
        return <Badge className="bg-red-700">Super Admin</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Websites</TableHead>
                <TableHead>Scripts</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Unnamed User'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {renderRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      {renderPlanBadge(user.plan)}
                    </TableCell>
                    <TableCell>{user.websites}</TableCell>
                    <TableCell>{user.scripts}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewUserDetails(user.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setUserToUpdatePlan({
                                userId: user.id, 
                                name: user.full_name || 'Unnamed User',
                                currentPlan: user.plan
                              });
                              setSelectedPlan(user.plan);
                            }}
                          >
                            Update Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Update Plan Dialog */}
      <Dialog open={!!userToUpdatePlan} onOpenChange={(open) => !open && setUserToUpdatePlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {userToUpdatePlan?.name}.
              Current plan: {userToUpdatePlan?.currentPlan}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.plan_type} value={plan.plan_type}>
                      <div className="flex flex-col">
                        <span className="font-medium capitalize">{plan.plan_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {plan.website_limit} websites, {plan.customization} customization
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUserToUpdatePlan(null)}
              disabled={updatingPlan}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => userToUpdatePlan && updateUserPlan(userToUpdatePlan.userId, selectedPlan)}
              disabled={updatingPlan}
            >
              {updatingPlan ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
