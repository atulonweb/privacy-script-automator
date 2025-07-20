import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, AlertTriangle } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useScripts } from '@/hooks/useScripts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import usePlanLimits from '@/hooks/usePlanLimits';
import PlanFeatureTable from '@/components/PlanFeatureTable';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WebsitesPage: React.FC = () => {
  const { websites, loading, error, fetchWebsites, addWebsite, updateWebsite, updateWebsiteStatus, deleteWebsite } = useWebsites();
  const { scripts, loading: scriptsLoading } = useScripts();
  const { enforcePlanLimits, planDetails, userPlan, websiteCount, refreshUserPlan } = usePlanLimits();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initializedRef = useRef(false);
  const navigate = useNavigate();

  // State for website form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
  const [currentWebsiteId, setCurrentWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    // Only run initialization once
    if (initializedRef.current) return;
    
    console.log("WebsitesPage mounted, initializing...");
    console.log("Current plan data:", { userPlan, planDetails, websiteCount });
    initializedRef.current = true;
    
    const loadData = async () => {
      try {
        console.log("Refreshing user plan...");
        await refreshUserPlan();
        console.log("Plan refreshed, new data:", { userPlan, planDetails, websiteCount });
      } catch (error) {
        console.error("Error loading plan data:", error);
      } finally {
        setIsInitialLoad(false);
      }
    };
    
    loadData();
    
    return () => {
      // Cleanup if component unmounts
      initializedRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  // Add an effect to log plan changes
  useEffect(() => {
    console.log("Plan data updated:", { userPlan, planDetails, websiteCount });
  }, [userPlan, planDetails, websiteCount]);

  const handleAddWebsite = async () => {
    if (!newWebsiteName || !newWebsiteDomain) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsAddingWebsite(true);

      const canAdd = await enforcePlanLimits.canCreateWebsite();
      if (!canAdd) {
        setIsAddDialogOpen(false);
        return;
      }

      await addWebsite(newWebsiteName, newWebsiteDomain);
      await refreshUserPlan();
      
      setNewWebsiteName('');
      setNewWebsiteDomain('');
      setIsAddDialogOpen(false);
      toast.success("Website added successfully");
    } catch (error: any) {
      toast.error(`Failed to add website: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingWebsite(false);
    }
  };

  const handleEditWebsite = (id: string) => {
    const website = websites.find(site => site.id === id);
    if (website) {
      setCurrentWebsiteId(id);
      setNewWebsiteName(website.name);
      setNewWebsiteDomain(website.domain);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateWebsite = async () => {
    if (!currentWebsiteId || !newWebsiteName || !newWebsiteDomain) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsAddingWebsite(true);
      await updateWebsite(currentWebsiteId, {
        name: newWebsiteName,
        domain: newWebsiteDomain
      });
      setIsEditDialogOpen(false);
      setNewWebsiteName('');
      setNewWebsiteDomain('');
      setCurrentWebsiteId(null);
    } catch (error: any) {
      toast.error(`Failed to update website: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAddingWebsite(false);
    }
  };

  const handleViewScript = (websiteId: string) => {
    // Find the associated script for this website
    const websiteScript = scripts.find(script => script.website_id === websiteId);
    
    if (websiteScript) {
      // Navigate to the script detail page
      navigate(`/dashboard/scripts/test/${websiteScript.script_id}`);
    } else {
      // No script found, navigate to script creation
      navigate('/dashboard/scripts/create', { 
        state: { selectedWebsiteId: websiteId }
      });
    }
  };

  // Show loading only during initial load
  const showLoading = isInitialLoad && (loading || scriptsLoading);

  // Check if user is approaching website limit (using real database values)
  const isOverLimit = websiteCount > planDetails.websiteLimit;
  const isAtLimit = websiteCount >= planDetails.websiteLimit;
  const isApproachingLimit = websiteCount >= planDetails.websiteLimit * 0.8;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Websites</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-600 hover:bg-brand-700" 
                disabled={isAtLimit || isOverLimit}
              >
                Add Website
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Website</DialogTitle>
                <DialogDescription>
                  Add your website details to create a consent script.
                  You can add up to {planDetails.websiteLimit} websites on your {userPlan} plan.
                  {isApproachingLimit && (
                    <span className="block mt-2 text-amber-600 font-medium">
                      ⚠️ You're using {websiteCount} of {planDetails.websiteLimit} websites. Consider upgrading your plan.
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
                <PlanFeatureTable />
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

          {/* Edit Website Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Website</DialogTitle>
                <DialogDescription>
                  Update your website details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Website Name</Label>
                  <Input
                    id="edit-name"
                    value={newWebsiteName}
                    onChange={(e) => setNewWebsiteName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-domain">Domain</Label>
                  <Input
                    id="edit-domain"
                    value={newWebsiteDomain}
                    onChange={(e) => setNewWebsiteDomain(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateWebsite}
                  disabled={isAddingWebsite}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isAddingWebsite ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Plan limit warnings */}
        {isOverLimit && (
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Plan Limit Exceeded:</strong> You have {websiteCount} websites but your {userPlan} plan only allows {planDetails.websiteLimit}. 
              Some features may be restricted. Please upgrade your plan or remove excess websites to continue using all features.
              <div className="mt-2">
                <Button variant="destructive" size="sm" onClick={() => navigate('/dashboard/plans')}>
                  Upgrade Plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isAtLimit && !isOverLimit && (
          <Alert className="border-amber-500 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Plan Limit Reached:</strong> You've reached your {planDetails.websiteLimit} website limit. 
              Please upgrade your plan to add more websites.
            </AlertDescription>
          </Alert>
        )}

        {/* Feature restrictions display */}
        <Card>
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">Current Plan Features ({userPlan})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Websites:</span> {websiteCount}/{planDetails.websiteLimit}
              </div>
              <div>
                <span className="font-medium">Analytics History:</span> {planDetails.analyticsHistory} days
              </div>
              <div>
                <span className="font-medium">Webhooks:</span> 
                <span className={planDetails.webhooksEnabled ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                  {planDetails.webhooksEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div>
                <span className="font-medium">White Label:</span>
                <span className={planDetails.whiteLabel ? "text-green-600 ml-1" : "text-red-600 ml-1"}>
                  {planDetails.whiteLabel ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {showLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error loading websites: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchWebsites(0)}>
              Try Again
            </Button>
          </div>
        ) : websites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't added any websites yet.</p>
              <Button 
                className="bg-brand-600 hover:bg-brand-700" 
                onClick={() => setIsAddDialogOpen(true)}
                disabled={isAtLimit || isOverLimit}
              >
                Add Your First Website
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website, index) => (
              <Card key={website.id} className={`overflow-hidden ${isOverLimit && index >= planDetails.websiteLimit ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="bg-gradient-to-r from-brand-100 to-brand-50 p-6">
                  <h3 className="text-xl font-bold">{website.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{website.domain}</p>
                  {isOverLimit && index >= planDetails.websiteLimit && (
                    <div className="mt-2">
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                        Exceeds Plan Limit
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Status:</span>
                      <span className={website.active ? "text-green-600" : "text-red-600"}>
                        {website.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(website.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 text-sm"
                        onClick={() => handleEditWebsite(website.id)}
                        disabled={isOverLimit && index >= planDetails.websiteLimit}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-sm" 
                        disabled={!website.active || (isOverLimit && index >= planDetails.websiteLimit)}
                        onClick={() => handleViewScript(website.id)}
                      >
                        Manage Script
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WebsitesPage;
