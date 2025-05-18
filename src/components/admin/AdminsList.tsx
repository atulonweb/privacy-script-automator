
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type Admin = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

interface AdminsListProps {
  admins: Admin[];
  onRefresh: () => Promise<void>;
  loading: boolean;
}

const AdminsList: React.FC<AdminsListProps> = ({ admins, onRefresh, loading }) => {
  const [isRemovingAdmin, setIsRemovingAdmin] = useState(false);
  const [adminToRemove, setAdminToRemove] = useState<Admin | null>(null);
  const { user } = useAuth();

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;
    
    try {
      setIsRemovingAdmin(true);
      
      // Don't allow removing yourself
      if (adminToRemove.id === user?.id) {
        toast.error("You can't remove your own admin privileges");
        return;
      }

      // Call edge function to remove admin role
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
        console.error("Edge function error:", result);
        throw new Error(result.error || 'Failed to remove admin role');
      }
      
      toast.success('Admin role removed successfully');
      onRefresh(); // Refresh the admins list
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast.error(error.message || 'An error occurred while removing admin');
    } finally {
      setIsRemovingAdmin(false);
      setAdminToRemove(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
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
  );
};

export default AdminsList;
