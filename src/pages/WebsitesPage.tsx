
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useScripts } from '@/hooks/useScripts';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import usePlanLimits from '@/hooks/usePlanLimits';
import PlanFeatureTable from '@/components/PlanFeatureTable';

const WebsitesPage: React.FC = () => {
  const { websites, loading, error, fetchWebsites, addWebsite, updateWebsite, updateWebsiteStatus, deleteWebsite } = useWebsites();
  const { scripts, fetchScripts, loading: scriptsLoading } = useScripts();
  const { checkWebsiteLimit, planDetails, userPlan } = usePlanLimits();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  // State for website form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
  const [currentWebsiteId, setCurrentWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    console.log("WebsitesPage mounted, fetching websites");
    const loadData = async () => {
      try {
        await Promise.all([fetchWebsites(), fetchScripts()]);
      } catch (error) {
        console.error("Error loading websites or scripts:", error);
      } finally {
        // Mark initial load as complete regardless of success/failure
        setIsInitialLoad(false);
      }
    };
    
    loadData();
  }, [fetchWebsites, fetchScripts]);

  const handleAddWebsite = async () => {
    if (!newWebsiteName || !newWebsiteDomain) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsAddingWebsite(true);

      // Check website limit before adding a new website - this enforces plan restrictions
      console.log('Checking website limit before adding new website');
      console.log('Current plan:', userPlan, 'Website limit:', planDetails.websiteLimit);
      console.log('Current websites count:', websites.length);

      const canAdd = await checkWebsiteLimit();
      if (!canAdd) {
        console.log('Website limit reached, cannot add more websites');
        setIsAddDialogOpen(false);
        return; // The checkWebsiteLimit function already shows a toast
      }

      await addWebsite(newWebsiteName, newWebsiteDomain);
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

  // Handle retry fetch button click
  const handleRetryFetch = () => {
    fetchWebsites(0); // Reset attempt counter when manually retrying
  };

  // Show loading only during initial load
  const showLoading = isInitialLoad && (loading || scriptsLoading);

  // Check if user is approaching website limit
  const isApproachingLimit = websites.length >= planDetails.websiteLimit * 0.8;
  const isAtLimit = websites.length >= planDetails.websiteLimit;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Websites</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-brand-600 hover:bg-brand-700" 
                disabled={isAtLimit}
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
                      ⚠️ You're using {websites.length} of {planDetails.websiteLimit} websites. Consider upgrading your plan.
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

        {/* Plan limit warning */}
        {isApproachingLimit && !isAtLimit && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <p className="text-amber-800">
                <strong>Plan Limit Warning:</strong> You're using {websites.length} of {planDetails.websiteLimit} websites. 
                Consider upgrading your plan to add more websites.
              </p>
            </CardContent>
          </Card>
        )}

        {isAtLimit && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-800">
                <strong>Plan Limit Reached:</strong> You've reached your {planDetails.websiteLimit} website limit. 
                Please upgrade your plan to add more websites.
              </p>
            </CardContent>
          </Card>
        )}

        {showLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error loading websites: {error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRetryFetch}>
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
                disabled={isAtLimit}
              >
                Add Your First Website
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => (
              <Card key={website.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-brand-100 to-brand-50 p-6">
                  <h3 className="text-xl font-bold">{website.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{website.domain}</p>
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
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-sm" 
                        disabled={!website.active}
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
