
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, PlusCircle, Copy, Trash2, Edit, Filter, Search, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScripts, ConsentScript } from '@/hooks/useScripts';
import { useWebsites } from '@/hooks/useWebsites';
import { useToast } from '@/hooks/use-toast';
import { generateCdnUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, subDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Type for sort options
type SortOption = 'website' | 'recent' | 'oldest';

// Filter type for scripts
interface ScriptFilters {
  search: string;
  websiteId: string | null;
  recentlyEdited: boolean;
}

const ScriptsPage: React.FC = () => {
  const { scripts, loading, error, fetchScripts, deleteScript } = useScripts();
  const { websites, fetchWebsites } = useWebsites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedScript, setSelectedScript] = useState<ConsentScript | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // New state for filtering and sorting
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filters, setFilters] = useState<ScriptFilters>({
    search: '',
    websiteId: null,
    recentlyEdited: false,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    console.log("ScriptsPage mounted, fetching scripts and websites");
    const loadData = async () => {
      try {
        await Promise.all([fetchScripts(), fetchWebsites()]);
      } catch (error) {
        console.error("Error loading scripts or websites:", error);
        // If we haven't exceeded max retries, try again after a delay
        if (retryCount < maxRetries) {
          const timeout = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadData();
          }, 2000); // 2 second delay between retries
          return () => clearTimeout(timeout);
        }
      } finally {
        // Mark initial load as complete regardless of success/failure
        setIsInitialLoad(false);
      }
    };
    
    loadData();
  }, [fetchScripts, fetchWebsites, retryCount]);

  useEffect(() => {
    console.log("Scripts loaded:", scripts);
    console.log("Websites loaded:", websites);
  }, [scripts, websites]);

  const handleCreateNew = () => {
    navigate('/dashboard/scripts/create');
  };

  const handleEditScript = (script: ConsentScript) => {
    // Navigate to edit page with the script data
    navigate(`/dashboard/scripts/edit/${script.id}`, { 
      state: { scriptData: script } 
    });
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
    const scriptCode = `<script src="${generateCdnUrl(scriptId)}" async></script>`;
    navigator.clipboard.writeText(scriptCode);
    setCopying(scriptId);
    toast({ 
      title: "Success", 
      description: "Script code copied to clipboard"
    });
    
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
      toast({
        title: "Success",
        description: "Script deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Error", 
        description: "Failed to delete script",
        variant: "destructive"
      });
    }
  };

  // Handle retry fetch button click
  const handleRetryFetch = () => {
    fetchScripts(0); // Reset attempt counter when manually retrying
  };

  // Check if a script was recently edited (within the last 7 days)
  const isRecentlyEdited = (script: ConsentScript) => {
    const updatedDate = new Date(script.updated_at);
    const sevenDaysAgo = subDays(new Date(), 7);
    return isAfter(updatedDate, sevenDaysAgo);
  };

  // Filter scripts based on search and filtering criteria
  const filteredScripts = scripts.filter(script => {
    // Filter by search term (check website name and domain)
    if (filters.search) {
      const websiteName = getWebsiteName(script.website_id).toLowerCase();
      const websiteDomain = getWebsiteDomain(script.website_id).toLowerCase();
      const searchLower = filters.search.toLowerCase();
      
      if (!websiteName.includes(searchLower) && 
          !websiteDomain.includes(searchLower) && 
          !script.script_id.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Filter by website
    if (filters.websiteId && script.website_id !== filters.websiteId) {
      return false;
    }
    
    // Filter by recently edited
    if (filters.recentlyEdited && !isRecentlyEdited(script)) {
      return false;
    }
    
    return true;
  });
  
  // Sort the filtered scripts
  const sortedScripts = [...filteredScripts].sort((a, b) => {
    switch (sortBy) {
      case 'website':
        return getWebsiteName(a.website_id).localeCompare(getWebsiteName(b.website_id));
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'oldest':
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      default:
        return 0;
    }
  });

  // Group scripts by website for organized view
  const scriptsGroupedByWebsite = sortedScripts.reduce((grouped, script) => {
    const websiteName = getWebsiteName(script.website_id);
    if (!grouped[websiteName]) {
      grouped[websiteName] = [];
    }
    grouped[websiteName].push(script);
    return grouped;
  }, {} as Record<string, ConsentScript[]>);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      websiteId: null,
      recentlyEdited: false
    });
  };

  // Show loading only during initial load
  const showLoading = isInitialLoad && (loading || !websites.length);

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

        {showLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">Error loading scripts: {error}</p>
            <Button onClick={handleRetryFetch} variant="outline" className="mt-4">
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
          <div className="space-y-4">
            {/* Filtering and View Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search scripts..."
                    className="pl-8 max-w-xs"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Filter Scripts</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal">By Website</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setFilters({ ...filters, websiteId: null })}>
                        All Websites
                      </DropdownMenuItem>
                      {websites.map(website => (
                        <DropdownMenuItem 
                          key={website.id}
                          onClick={() => setFilters({ ...filters, websiteId: website.id })}
                        >
                          {website.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-normal">By Last Modified</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => setFilters({ ...filters, recentlyEdited: !filters.recentlyEdited })}
                      >
                        {filters.recentlyEdited ? '✓ ' : ''} Recently Modified
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={resetFilters}>
                      Reset All Filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort: {sortBy === 'recent' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Website'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setSortBy('recent')}>
                      {sortBy === 'recent' ? '✓ ' : ''}Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                      {sortBy === 'oldest' ? '✓ ' : ''}Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('website')}>
                      {sortBy === 'website' ? '✓ ' : ''}By Website
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                    <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                    <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                    <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                  </div>
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="h-1 w-4 rounded-sm bg-current"></div>
                    <div className="h-1 w-4 rounded-sm bg-current"></div>
                    <div className="h-1 w-4 rounded-sm bg-current"></div>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Show filter indicators if any filters are applied */}
            {(filters.search || filters.websiteId || filters.recentlyEdited) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {filters.search && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: {filters.search}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setFilters({...filters, search: ''})}
                    >
                      <span className="sr-only">Remove</span>
                      ×
                    </Button>
                  </Badge>
                )}
                {filters.websiteId && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Website: {getWebsiteName(filters.websiteId)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setFilters({...filters, websiteId: null})}
                    >
                      <span className="sr-only">Remove</span>
                      ×
                    </Button>
                  </Badge>
                )}
                {filters.recentlyEdited && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Recently Modified
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1"
                      onClick={() => setFilters({...filters, recentlyEdited: false})}
                    >
                      <span className="sr-only">Remove</span>
                      ×
                    </Button>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={resetFilters}
                >
                  Clear All
                </Button>
              </div>
            )}

            {filteredScripts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No scripts match your filters.</p>
                  <Button 
                    variant="link" 
                    onClick={resetFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* List View */}
                {viewMode === 'list' && (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Website</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Colors</TableHead>
                            <TableHead>Last Modified</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedScripts.map((script) => (
                            <TableRow key={script.id}>
                              <TableCell>
                                <div className="font-medium">{getWebsiteName(script.website_id)}</div>
                                <div className="text-xs text-muted-foreground">{getWebsiteDomain(script.website_id)}</div>
                                {isRecentlyEdited(script) && (
                                  <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Recently Updated
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{script.banner_position}</TableCell>
                              <TableCell>
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
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">
                                    {format(new Date(script.updated_at), 'PPP')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleEditScript(script)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                    onClick={() => handleCopyScript(script.script_id)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(script)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <>
                    {/* If sorting by website, show grouped view */}
                    {sortBy === 'website' ? (
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-4 flex-wrap">
                          <TabsTrigger value="all">All Websites</TabsTrigger>
                          {Object.keys(scriptsGroupedByWebsite).map(websiteName => (
                            <TabsTrigger key={websiteName} value={websiteName}>
                              {websiteName}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        <TabsContent value="all" className="mt-0">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {sortedScripts.map((script) => (
                              <ScriptCard
                                key={script.id}
                                script={script}
                                getWebsiteName={getWebsiteName}
                                getWebsiteDomain={getWebsiteDomain}
                                isRecentlyEdited={isRecentlyEdited}
                                handleEditScript={handleEditScript}
                                handleCopyScript={handleCopyScript}
                                handleDelete={handleDelete}
                                copying={copying}
                                navigate={navigate}
                              />
                            ))}
                          </div>
                        </TabsContent>
                        
                        {Object.entries(scriptsGroupedByWebsite).map(([websiteName, websiteScripts]) => (
                          <TabsContent key={websiteName} value={websiteName} className="mt-0">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {websiteScripts.map((script) => (
                                <ScriptCard
                                  key={script.id}
                                  script={script}
                                  getWebsiteName={getWebsiteName}
                                  getWebsiteDomain={getWebsiteDomain}
                                  isRecentlyEdited={isRecentlyEdited}
                                  handleEditScript={handleEditScript}
                                  handleCopyScript={handleCopyScript}
                                  handleDelete={handleDelete}
                                  copying={copying}
                                  navigate={navigate}
                                />
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sortedScripts.map((script) => (
                          <ScriptCard
                            key={script.id}
                            script={script}
                            getWebsiteName={getWebsiteName}
                            getWebsiteDomain={getWebsiteDomain}
                            isRecentlyEdited={isRecentlyEdited}
                            handleEditScript={handleEditScript}
                            handleCopyScript={handleCopyScript}
                            handleDelete={handleDelete}
                            copying={copying}
                            navigate={navigate}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
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

// Extract the script card to a separate component for reusability
interface ScriptCardProps {
  script: ConsentScript;
  getWebsiteName: (websiteId: string) => string;
  getWebsiteDomain: (websiteId: string) => string;
  isRecentlyEdited: (script: ConsentScript) => boolean;
  handleEditScript: (script: ConsentScript) => void;
  handleCopyScript: (scriptId: string) => void;
  handleDelete: (script: ConsentScript) => void;
  copying: string | null;
  navigate: any;
}

const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  getWebsiteName,
  getWebsiteDomain,
  isRecentlyEdited,
  handleEditScript,
  handleCopyScript,
  handleDelete,
  copying,
  navigate
}) => {
  return (
    <Card key={script.id} className={`${isRecentlyEdited(script) ? 'border-blue-200 shadow-sm' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              {getWebsiteName(script.website_id)}
              {isRecentlyEdited(script) && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Recent
                </Badge>
              )}
            </div>
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {getWebsiteDomain(script.website_id)}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => handleEditScript(script)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(script)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last modified: {format(new Date(script.updated_at), 'PPP')}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
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
        <Button 
          variant="secondary"
          className="w-full"
          onClick={() => navigate(`/dashboard/scripts/test/${script.id}`, { 
            state: { scriptData: script, websiteName: getWebsiteName(script.website_id) }
          })}
        >
          Test Script
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScriptsPage;
