
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminForm from '@/components/admin/AdminForm';

type Admin = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRemovingAdmin, setIsRemovingAdmin] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<Admin | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Get all users with admin role
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      const adminUsers = users.users.filter(user => 
        user.app_metadata?.role === 'admin'
      );
      
      // Get more details for each admin from the profiles table
      const adminsWithDetails = await Promise.all(adminUsers.map(async (admin) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', admin.id)
          .single();
        
        return {
          id: admin.id,
          email: admin.email || 'No email',
          full_name: profile?.full_name || null,
          created_at: admin.created_at || new Date().toISOString(),
        };
      }));
      
      setAdmins(adminsWithDetails);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;
    
    try {
      setIsRemovingAdmin(true);
      
      // Don't allow removing yourself
      if (adminToRemove.id === user?.id) {
        toast.error("You can't remove your own admin privileges");
        return;
      }

      // Call our admin-role edge function to remove admin role
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-role', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ userId: adminToRemove.id }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove admin role');
      }
      
      toast.success('Admin role removed successfully');
      setAdmins(admins.filter(admin => admin.id !== adminToRemove.id));
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast.error(error.message || 'An error occurred while removing admin');
    } finally {
      setIsRemovingAdmin(false);
      setAdminToRemove(null);
    }
  };

  const handleAdminAdded = () => {
    setIsFormOpen(false);
    fetchAdmins();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Enter the email of the user you want to promote to admin. They must have an existing account.
                </DialogDescription>
              </DialogHeader>
              <AdminForm onSuccess={handleAdminAdded} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Manage all administrators in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.full_name || 'No name provided'}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{formatDate(admin.created_at)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => setAdminToRemove(admin)}
                              disabled={admin.id === user?.id}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Admin Role</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove admin privileges from {admin.full_name || admin.email}?
                                This action will downgrade them to a regular user.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setAdminToRemove(null)}
                                disabled={isRemovingAdmin}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={handleRemoveAdmin}
                                disabled={isRemovingAdmin}
                              >
                                {isRemovingAdmin ? 'Removing...' : 'Remove Admin'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {admins.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No administrators found
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        Loading admins...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminManagementPage;
