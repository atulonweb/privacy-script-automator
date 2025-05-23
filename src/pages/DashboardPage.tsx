import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CopyIcon, CheckIcon, Loader, Plus, PlusCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsites } from '@/hooks/useWebsites';
import { useScripts } from '@/hooks/useScripts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { generateCdnUrl } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePlanLimits } from '@/hooks/usePlanLimits';

const DashboardPage: React.FC = () => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const { websites, loading: websitesLoading, addWebsite, updateWebsiteStatus } = useWebsites();
  const { scripts, loading: scriptsLoading } = useScripts();
  const { chartData, loading: analyticsLoading } = useAnalytics();
  const { enforcePlanLimits, planDetails, userPlan, websiteCount } = usePlanLimits();
  
  const totalVisitors = websites.reduce((acc, site) => {
    // For each website, add the visitor_count (or 0 if undefined)
    return acc + (site.visitor_count || 0);
  }, 0);
  
  const averageAcceptRate = websites.length > 0
    ? Math.round(websites.reduce((acc, site) => acc + (site.accept_rate || 0), 0) / websites.length)
    : 0;
    
  const handleAddWebsite = async () => {
    if (!newWebsiteName || !newWebsiteDomain) return;
    
    // Check plan limits before adding website
    const canAdd = await enforcePlanLimits.canCreateWebsite();
    if (!canAdd) {
      setIsAddDialogOpen(false);
      return;
    }
    
    setIsAddingWebsite(true);
    try {
      await addWebsite(newWebsiteName, newWebsiteDomain);
      setNewWebsiteName('');
      setNewWebsiteDomain('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding website:', error);
    } finally {
      setIsAddingWebsite(false);
    }
  };
  
  const getRecentScript = () => {
    if (scripts.length === 0) return null;
    return scripts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };
  
  const recentScript = getRecentScript();
  
  const handleCopyScript = () => {
    if (!recentScript) return;
    
    const scriptCode = `<script src="https://cdn.consentguard.com/cg.js?id=${recentScript.script_id}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    
    setTimeout(() => {
      setCopiedScript(false);
    }, 3000);
  };

  // Check if user is at limit
  const isAtLimit = websiteCount >= planDetails.websiteLimit;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-600 hover:bg-brand-700"
                disabled={isAtLimit}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Website</DialogTitle>
                <DialogDescription>
                  Add details about your website to create a consent script.
                  You can add up to {planDetails.websiteLimit} websites on your {userPlan} plan.
                  {websiteCount >= planDetails.websiteLimit * 0.8 && (
                    <span className="block mt-2 text-amber-600 font-medium">
                      ⚠️ You're using {websiteCount} of {planDetails.websiteLimit} websites.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Website Name</Label>
                  <Input
                    id="name"
                    placeholder="My Company Website"
                    value={newWebsiteName}
                    onChange={(e) => setNewWebsiteName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={newWebsiteDomain}
                    onChange={(e) => setNewWebsiteDomain(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddWebsite}
                  disabled={isAddingWebsite}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isAddingWebsite ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : 'Add Website'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              {websitesLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{websites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active websites using ConsentGuard
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {websitesLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {totalVisitors.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visitors across all your websites
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Acceptance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {websitesLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {averageAcceptRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Users who accepted cookies
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Scripts Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scriptsLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{scripts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active consent scripts
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Consent Analytics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader className="h-8 w-8 animate-spin text-brand-600" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="accept" stackId="1" stroke="#2563eb" fill="#2563eb" name="Accept" />
                    <Area type="monotone" dataKey="partial" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Partial" />
                    <Area type="monotone" dataKey="reject" stackId="1" stroke="#dc2626" fill="#dc2626" name="Reject" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-muted-foreground">No analytics data available yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Data will appear once visitors interact with your consent banner.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Your Consent Script</CardTitle>
              <CardDescription>
                {recentScript 
                  ? "Add this script to your website's <head> tag"
                  : "Create a script to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scriptsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader className="h-8 w-8 animate-spin text-brand-600" />
                </div>
              ) : recentScript ? (
                <>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    {`<script src="https://cdn.consentguard.com/cg.js?id=${recentScript.script_id}" async></script>`}
                  </div>
                  <Button 
                    onClick={handleCopyScript} 
                    variant="outline" 
                    className="mt-4 w-full"
                  >
                    {copiedScript ? (
                      <>
                        <CheckIcon className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy Script
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground mb-4">
                    No consent scripts created yet.
                  </p>
                  <Button 
                    className="bg-brand-600 hover:bg-brand-700"
                    onClick={() => navigate('/dashboard/scripts/create')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Script
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Websites</CardTitle>
            <CardDescription>
              Manage your websites and view their consent statistics.
              Using {websiteCount} of {planDetails.websiteLimit} websites allowed on your {userPlan} plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {websitesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : websites.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Domain</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {websites.map((site) => (
                      <tr key={site.id} className="border-b">
                        <td className="py-3 px-4">{site.name}</td>
                        <td className="py-3 px-4">{site.domain}</td>
                        <td className="py-3 px-4">
                          <Badge className={site.active ? "bg-green-500" : "bg-gray-500"}>
                            {site.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/dashboard/scripts/create')}
                            >
                              Create Script
                            </Button>
                            <Button 
                              variant={site.active ? "destructive" : "secondary"} 
                              size="sm"
                              onClick={() => updateWebsiteStatus(site.id, !site.active)}
                            >
                              {site.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't added any websites yet.
                </p>
                <Button 
                  className="bg-brand-600 hover:bg-brand-700"
                  onClick={() => setIsAddDialogOpen(true)}
                  disabled={isAtLimit}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Website
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
