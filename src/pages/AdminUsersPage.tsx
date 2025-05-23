
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [userToUpdatePlan, setUserToUpdatePlan] = useState<{userId: string, name: string} | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use the admin-settings edge function to get all users
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ action: 'get_users' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      // Get subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan');

      if (subscriptionError) {
        console.error("Subscription error:", subscriptionError);
      }

      // Create a map of user_id to plan
      const subscriptionMap = subscriptionData?.reduce((acc: any, item: any) => {
        acc[item.user_id] = item.plan;
        return acc;
      }, {}) || {};

      // Process users from edge function
      const processedUsers = data.users?.map((user: any) => ({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
        email: user.email,
        plan: subscriptionMap[user.id] || 'free'
      })) || [];

      setUsers(processedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error('Failed to fetch users', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      setUpdatingPlan(true);
      
      console.log('Updating plan for user:', userId, 'to plan:', plan);
      
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
      
      // Refresh the users list
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
  
  const viewUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const renderPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Badge className="bg-purple-500">Pro</Badge>;
      case 'business':
        return <Badge className="bg-blue-600">Business</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-500">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
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
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
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
                      {renderPlanBadge(user.plan)}
                    </TableCell>
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
                                name: user.full_name || 'Unnamed User'
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
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <TooltipProvider>
                <div className="grid grid-cols-2 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedPlan === 'free' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedPlan('free')}
                      >
                        Free
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Basic features, 1 website</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedPlan === 'pro' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedPlan('pro')}
                      >
                        Pro
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Full features, 5 websites</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedPlan === 'business' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedPlan('business')}
                      >
                        Business
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>All features, 20 websites, priority support</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedPlan === 'enterprise' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedPlan('enterprise')}
                      >
                        Enterprise
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Unlimited websites, dedicated support</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUserToUpdatePlan(null)}
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
