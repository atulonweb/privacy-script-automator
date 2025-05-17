
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
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AdminForm from '@/components/admin/AdminForm';

type Admin = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Get all users with admin role
      const { data: adminUsers, error: adminError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (adminError) throw adminError;
      
      // Enhance with user auth details
      const enhancedAdmins = await Promise.all(
        adminUsers.map(async (admin) => {
          try {
            const { data: userData, error: userDataError } = await supabase.auth.admin.getUserById(admin.id);
            if (userDataError) throw userDataError;
            
            // Only include if they have admin role
            if (userData?.user?.app_metadata?.role === 'admin') {
              return {
                id: admin.id,
                email: userData?.user?.email || 'No email',
                full_name: admin.full_name,
                created_at: admin.created_at,
              };
            }
            return null;
          } catch (error) {
            console.error("Error fetching admin details:", error);
            return null;
          }
        })
      );
      
      // Filter out null values and set admins
      setAdmins(enhancedAdmins.filter(admin => admin !== null) as Admin[]);
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      toast.error(`Failed to load admins: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    navigate(`/admin/admins/edit/${admin.id}`);
  };

  const confirmDeleteAdmin = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    try {
      // Remove admin role
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-role', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: adminToDelete.id 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove admin role');
      }

      toast.success('Admin role has been removed successfully.');
      
      // Refresh admins list
      fetchAdmins();
      
    } catch (error: any) {
      console.error("Error removing admin role:", error);
      toast.error(error.message || 'An error occurred while removing admin role');
    } finally {
      setIsDeleteConfirmOpen(false);
      setAdminToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredAdmins = admins.filter(admin => 
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.full_name && admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <Button onClick={handleAddAdmin}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Admin
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Administrators</CardTitle>
            <CardDescription>
              View and manage administrator accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Admin Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.full_name || 'No name provided'}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(admin.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditAdmin(admin)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => confirmDeleteAdmin(admin)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredAdmins.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No administrators found
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Loading administrators...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
            <DialogDescription>
              Add a new administrator to the system
            </DialogDescription>
          </DialogHeader>
          
          <AdminForm onSuccess={() => {
            setIsAddDialogOpen(false);
            fetchAdmins();
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Admin Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin privileges from {adminToDelete?.full_name || adminToDelete?.email}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              Remove Admin Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminManagementPage;
