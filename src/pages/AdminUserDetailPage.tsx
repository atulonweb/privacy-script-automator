
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Globe, Code, Webhook } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Website {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
}

interface Script {
  id: string;
  script_id: string;
  website_id: string;
  banner_position: string;
  banner_color: string;
  created_at: string;
}

interface Webhook {
  id: string;
  url: string;
  enabled: boolean;
  website_id: string; // Added website_id property to match database schema
  created_at: string;
}

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    setFetchError(null);
    
    try {
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
      let edgeFunctionError = null;
      
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
          edgeFunctionError = responseData.error || "Failed to get user data from edge function";
        }
      } catch (error) {
        console.error('Edge function error:', error);
        edgeFunctionError = error instanceof Error ? error.message : "Unknown edge function error";
      }
      
      // If we couldn't get user data from edge function, fallback to the profile with placeholders
      if (!userData) {
        console.log('Using fallback user data');
        const fallbackEmail = `user-${userId.substring(0, 6)}@example.com`;
        
        if (edgeFunctionError) {
          console.warn(`Edge function failed: ${edgeFunctionError}. Using fallback email: ${fallbackEmail}`);
        }
        
        userData = {
          email: fallbackEmail,
          role: 'user',
          created_at: profileData.created_at
        };
      }
      
      const userDetails: UserDetails = {
        id: userId,
        email: userData.email || `user-${userId.substring(0, 6)}@example.com`,
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
      
      // Fetch user's webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', userId);
      
      if (webhooksError) throw webhooksError;
      console.log("Fetched webhooks:", webhooksData);
      setWebhooks(webhooksData || []);
      
      if (webhooksData && webhooksData.length > 0) {
        console.log(`Found ${webhooksData.length} webhooks for user ${userId}`);
      } else {
        console.log(`No webhooks found for user ${userId}`);
      }
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setFetchError(error.message);
      toast.error(`Failed to load user details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    if (!userDetails?.full_name) return '?';
    
    const nameParts = userDetails.full_name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return userDetails.full_name[0]?.toUpperCase() || '?';
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
          </div>
        </div>

        {fetchError && (
          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-600">
                <p className="font-semibold">Error loading data:</p>
                <p>{fetchError}</p>
              </div>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={() => fetchUserDetails()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">Loading user details...</p>
              </div>
            </CardContent>
          </Card>
        ) : userDetails ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-purple-100 text-purple-800 text-xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{userDetails.full_name || 'No name provided'}</CardTitle>
                    <CardDescription className="text-lg">{userDetails.email}</CardDescription>
                    <div className="mt-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${userDetails.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {userDetails.role || 'user'}
                      </span>
                      <span className="text-xs text-gray-500 ml-4">
                        Joined: {formatDate(userDetails.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="websites">
                  <TabsList>
                    <TabsTrigger value="websites" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" /> Websites
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {websites.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="scripts" className="flex items-center">
                      <Code className="mr-2 h-4 w-4" /> Scripts
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {scripts.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="flex items-center">
                      <Webhook className="mr-2 h-4 w-4" /> Webhooks
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {webhooks.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="websites" className="mt-4 space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {websites.length > 0 ? (
                            websites.map((website) => (
                              <TableRow key={website.id}>
                                <TableCell className="font-medium">{website.name}</TableCell>
                                <TableCell>{website.domain}</TableCell>
                                <TableCell>
                                  <span 
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${website.active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                      }`}
                                  >
                                    {website.active ? 'Active' : 'Inactive'}
                                  </span>
                                </TableCell>
                                <TableCell>{formatDate(website.created_at)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                No websites found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scripts" className="mt-4 space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Script ID</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scripts.length > 0 ? (
                            scripts.map((script) => {
                              // Find the website name for this script
                              const website = websites.find(w => w.id === script.website_id);
                              
                              return (
                                <TableRow key={script.id}>
                                  <TableCell className="font-medium">{script.script_id}</TableCell>
                                  <TableCell>{website ? website.name : 'Unknown website'}</TableCell>
                                  <TableCell>{script.banner_position || 'Default'}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: script.banner_color || '#4F46E5' }}
                                      ></div>
                                      <span>{script.banner_color || 'Default'}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatDate(script.created_at)}</TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No scripts found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="webhooks" className="mt-4 space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhooks.length > 0 ? (
                            webhooks.map((webhook) => {
                              // Find the website name for this webhook
                              const website = websites.find(w => w.id === webhook.website_id);
                              
                              return (
                                <TableRow key={webhook.id}>
                                  <TableCell className="font-medium truncate max-w-[300px]">
                                    {webhook.url}
                                  </TableCell>
                                  <TableCell>{website ? website.name : 'All websites'}</TableCell>
                                  <TableCell>
                                    <span 
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${webhook.enabled 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                      {webhook.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </TableCell>
                                  <TableCell>{formatDate(webhook.created_at)}</TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                No webhooks found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">User not found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetailPage;
