
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, RefreshCw } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminForm from '@/components/admin/AdminForm';
import { AdminsList } from '@/components/admin/AdminsList';
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';

const AdminManagementPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    admins,
    loading,
    refreshing,
    fetchAdmins,
    handleAdminAdded
  } = useAdminManagement();

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchAdmins}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
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
                <AdminForm onSuccess={() => {
                  setIsFormOpen(false);
                  handleAdminAdded();
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Administrators</CardTitle>
            <CardDescription>
              Manage all administrators in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminsList 
              admins={admins} 
              onRefresh={fetchAdmins} 
              loading={loading} 
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminManagementPage;
