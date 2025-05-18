
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Code, Webhook, RefreshCw } from 'lucide-react';
import UserProfileHeader from '@/components/admin/UserProfileHeader';
import UserWebsitesTable from '@/components/admin/UserWebsitesTable';
import UserScriptsTable from '@/components/admin/UserScriptsTable';
import UserWebhooksTable from '@/components/admin/UserWebhooksTable';
import { useUserDetails } from '@/hooks/admin/useUserDetails';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const {
    userDetails,
    websites,
    scripts,
    webhooks,
    loading,
    fetchError,
    isRefreshing,
    refreshUserDetails
  } = useUserDetails(userId);

  // Default to the "websites" tab
  const [activeTab, setActiveTab] = useState("websites");

  // Stabilize arrays to prevent re-renders
  const safeWebsites = useMemo(() => Array.isArray(websites) ? websites : [], [websites]);
  const safeScripts = useMemo(() => Array.isArray(scripts) ? scripts : [], [scripts]);
  const safeWebhooks = useMemo(() => Array.isArray(webhooks) ? webhooks : [], [webhooks]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      refreshUserDetails();
    }
  };

  // Log webhooks data only once when initially loaded or when actually changed
  useEffect(() => {
    console.log("AdminUserDetailPage received webhooks:", webhooks);
    console.log("Webhooks array length:", webhooks?.length || 0);
    console.log("Webhooks array content:", webhooks);
  }, [webhooks?.length]);

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
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
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
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && !userDetails ? (
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
                <UserProfileHeader 
                  fullName={userDetails.full_name}
                  email={userDetails.email}
                  role={userDetails.role}
                  createdAt={userDetails.created_at}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="websites" className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" /> Websites
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {safeWebsites.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="scripts" className="flex items-center">
                      <Code className="mr-2 h-4 w-4" /> Scripts
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {safeScripts.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="flex items-center">
                      <Webhook className="mr-2 h-4 w-4" /> Webhooks
                      <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                        {safeWebhooks.length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="websites" className="mt-4 space-y-4">
                    <UserWebsitesTable websites={safeWebsites} />
                  </TabsContent>
                  
                  <TabsContent value="scripts" className="mt-4 space-y-4">
                    <UserScriptsTable scripts={safeScripts} websites={safeWebsites} />
                  </TabsContent>
                  
                  <TabsContent value="webhooks" className="mt-4 space-y-4">
                    <UserWebhooksTable webhooks={safeWebhooks} websites={safeWebsites} />
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
