
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
import { Search, UserPlus, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string;
  websites: number;
  scripts: number;
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isPromotingUser, setIsPromotingUser] = useState<boolean>(false);
  const [isDemotingUser, setIsDemotingUser] = useState<boolean>(false);
  const [userToPromote, setUserToPromote] = useState<User | null>(null);
  const [userToDemote, setUserToDemote] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Then for each profile, get additional data
      const enhancedUsers = await Promise.all(profiles.map(async (profile) => {
        try {
          // Get user auth data
          const { data: userData, error: userDataError } = await supabase.auth.admin.getUserById(profile.id);
          if (userDataError) throw userDataError;
          
          // Get website count
          const { count: websiteCount, error: websiteError } = await supabase
            .from('websites')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (websiteError) throw websiteError;
          
          // Get script count
          const { count: scriptCount, error: scriptError } = await supabase
            .from('consent_scripts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          if (scriptError) throw scriptError;
          
          return {
            id: profile.id,
            email: userData?.user?.email || 'No email',
            full_name: profile.full_name,
            created_at: profile.created_at,
            role: userData?.user?.app_metadata?.role || 'user',
            websites: websiteCount || 0,
            scripts: scriptCount || 0
          };
        } catch (error) {
          console.error("Error fetching user details:", error);
          return {
            id: profile.id,
            email: "Error fetching email",
            full_name: profile.full_name,
            created_at: profile.created_at,
            role: 'unknown',
            websites: 0,
            scripts: 0
          };
        }
      }));
      
      setUsers(enhancedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  };

  const promoteUserToAdmin = async (userId: string, email: string) => {
    try {
      setIsPromotingUser(true);
      
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to promote user to admin');
      }

      toast.success(data.message || 'User successfully promoted to admin!');
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: 'admin' } 
            : user
        )
      );
      
    } catch (error: any) {
      console.error("Error promoting user:", error);
      toast.error(error.message || 'An error occurred while promoting user');
    } finally {
      setIsPromotingUser(false);
      setUserToPromote(null);
    }
  };

  const demoteAdminToUser = async (userId: string) => {
    try {
      setIsDemotingUser(true);
      
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-role', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove admin role');
      }

      toast.success('Admin role removed successfully');
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: 'user' } 
            : user
        )
      );
      
    } catch (error: any) {
      console.error("Error demoting user:", error);
      toast.error(error.message || 'An error occurred while demoting user');
    } finally {
      setIsDemotingUser(false);
      setUserToDemote(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <Button onClick={() => navigate('/admin/users/invite')}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all users in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  onValueChange={(value) => setSelectedRole(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* User Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Websites</TableHead>
                      <TableHead>Scripts</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'No name provided'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {user.role || 'user'}
                          </span>
                        </TableCell>
                        <TableCell>{user.websites}</TableCell>
                        <TableCell>{user.scripts}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {user.role !== 'admin' ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setUserToPromote(user)}
                                  >
                                    <Shield className="mr-1 h-3 w-3" />
                                    Make Admin
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Promote User to Admin</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to promote {user.full_name || user.email} to admin? 
                                      This will give them full access to all administration features.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setUserToPromote(null)}
                                      disabled={isPromotingUser}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      onClick={() => userToPromote && promoteUserToAdmin(userToPromote.id, userToPromote.email)}
                                      disabled={isPromotingUser}
                                    >
                                      {isPromotingUser ? 'Processing...' : 'Confirm'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                    onClick={() => setUserToDemote(user)}
                                  >
                                    <Shield className="mr-1 h-3 w-3" />
                                    Remove Admin
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Remove Admin Role</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove admin privileges from {user.full_name || user.email}? 
                                      They will be downgraded to a regular user.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => setUserToDemote(null)}
                                      disabled={isDemotingUser}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => userToDemote && demoteAdminToUser(userToDemote.id)}
                                      disabled={isDemotingUser}
                                    >
                                      {isDemotingUser ? 'Processing...' : 'Remove Admin'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredUsers.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Loading users...
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
    </AdminLayout>
  );
};

export default AdminUsersPage;
