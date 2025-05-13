
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, PlusCircle, Copy, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScripts, ConsentScript } from '@/hooks/useScripts';
import { useWebsites } from '@/hooks/useWebsites';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ScriptsPage: React.FC = () => {
  const { scripts, loading, error, fetchScripts, deleteScript } = useScripts();
  const { websites, fetchWebsites } = useWebsites();
  const navigate = useNavigate();
  const [selectedScript, setSelectedScript] = React.useState<ConsentScript | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [copying, setCopying] = React.useState<string | null>(null);

  useEffect(() => {
    console.log("ScriptsPage mounted, fetching scripts and websites");
    fetchScripts();
    fetchWebsites();
  }, [fetchScripts, fetchWebsites]);

  useEffect(() => {
    console.log("Scripts loaded:", scripts);
    console.log("Websites loaded:", websites);
  }, [scripts, websites]);

  const handleCreateNew = () => {
    navigate('/dashboard/scripts/create');
  };

  const getWebsiteName = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId);
    return website ? website.name : 'Unknown Website';
  };

  const getWebsiteDomain = (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId);
    return website ? website.domain : 'unknown.com';
  };

  const handleCopyScript = (scriptId: string) => {
    const scriptCode = `<script src="https://cdn.consentguard.com/cg.js?id=${scriptId}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopying(scriptId);
    toast.success("Script code copied to clipboard");
    
    setTimeout(() => {
      setCopying(null);
    }, 2000);
  };

  const handleDelete = (script: ConsentScript) => {
    setSelectedScript(script);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedScript) return;
    
    try {
      await deleteScript(selectedScript.id);
      setDeleteDialogOpen(false);
      setSelectedScript(null);
      toast.success("Script deleted successfully");
    } catch (error) {
      console.error('Error deleting script:', error);
      toast.error("Failed to delete script");
    }
  };

  console.log("Rendering ScriptsPage with", scripts.length, "scripts");

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Your Scripts</h2>
          
          <Button onClick={handleCreateNew} className="bg-brand-600 hover:bg-brand-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Script
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error loading scripts: {error}</p>
            <Button onClick={fetchScripts} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : scripts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any scripts yet.</p>
              <Button onClick={handleCreateNew} className="bg-brand-600 hover:bg-brand-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Script
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Card key={script.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <div>{getWebsiteName(script.website_id)}</div>
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        {getWebsiteDomain(script.website_id)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(script)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Position:</span> {script.banner_position}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Colors:</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{backgroundColor: script.banner_color}}
                          title="Banner color"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{backgroundColor: script.text_color}}
                          title="Text color"
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{backgroundColor: script.button_color}}
                          title="Button color"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">Auto-hide:</span> {script.auto_hide ? `Yes (${script.auto_hide_time}s)` : 'No'}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleCopyScript(script.script_id)}
                  >
                    {copying === script.script_id ? (
                      <>Copy Code (Copied!)</>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Script</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this script? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ScriptsPage;
