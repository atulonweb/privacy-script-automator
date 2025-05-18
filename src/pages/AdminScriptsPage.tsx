
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
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Script {
  id: string;
  script_id: string; 
  user_id: string;
  website_id: string;
  banner_position: string;
  banner_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  auto_hide: boolean;
  auto_hide_time: number;
  show_powered_by: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_full_name?: string;
  website_name?: string;
  website_domain?: string;
  category?: string;
  active?: boolean;
}

const mockScripts: Script[] = [
  {
    id: '1',
    script_id: 'script-123',
    user_id: 'user1',
    website_id: 'web1',
    banner_position: 'bottom',
    banner_color: '#f0f0f0',
    text_color: '#000000',
    button_color: '#4F46E5',
    button_text_color: '#FFFFFF',
    auto_hide: true,
    auto_hide_time: 10,
    show_powered_by: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_email: 'user1@example.com',
    user_full_name: 'User One',
    website_name: 'My First Website',
    website_domain: 'example.com',
    category: 'analytics',
    active: true
  },
  {
    id: '2',
    script_id: 'script-456',
    user_id: 'user2',
    website_id: 'web2',
    banner_position: 'top',
    banner_color: '#e0e0e0',
    text_color: '#333333',
    button_color: '#22C55E',
    button_text_color: '#FFFFFF',
    auto_hide: false,
    auto_hide_time: 0,
    show_powered_by: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_email: 'user2@example.com',
    user_full_name: 'User Two',
    website_name: 'Blog Website',
    website_domain: 'blog.example.com',
    category: 'advertising',
    active: true
  },
  {
    id: '3',
    script_id: 'script-789',
    user_id: 'user3',
    website_id: 'web3',
    banner_position: 'bottom-right',
    banner_color: '#d0d0d0',
    text_color: '#222222',
    button_color: '#EF4444',
    button_text_color: '#FFFFFF',
    auto_hide: true,
    auto_hide_time: 15,
    show_powered_by: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    user_email: 'user3@example.com',
    user_full_name: 'User Three',
    website_name: 'E-commerce Store',
    website_domain: 'store.example.com',
    category: 'social',
    active: false
  }
];

const AdminScriptsPage = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['analytics', 'advertising', 'social', 'functional', 'custom']);
  const [updatingScript, setUpdatingScript] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [paginatedScripts, setPaginatedScripts] = useState<Script[]>([]);

  useEffect(() => {
    fetchScripts();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [searchTerm, selectedCategory, selectedDomain, scripts]);

  useEffect(() => {
    paginateScripts();
  }, [filteredScripts, currentPage, itemsPerPage]);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      
      // Fetch scripts, websites, and user profiles
      const { data: scriptData, error: scriptError } = await supabase
        .from('consent_scripts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (scriptError) {
        console.error("Error fetching scripts:", scriptError);
        throw scriptError;
      }
      
      // Fetch websites for domain info
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('id, domain, name, active');
      
      if (websitesError) {
        console.error("Error fetching websites:", websitesError);
        throw websitesError;
      }
      
      // Fetch user profiles for email and name info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      // Create maps for quick lookups
      const websiteMap = new Map(websites?.map(website => [website.id, website]) || []);
      const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);
      
      // Try to fetch emails from admin function
      let userEmailMap = new Map();
      try {
        const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ action: 'get_users' }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.users) {
            data.users.forEach((user: any) => {
              userEmailMap.set(user.id, user.email);
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user emails:", error);
      }
      
      // Get all unique domains from websites
      const uniqueDomains = [...new Set(websites?.map(website => website.domain) || [])];
      setDomains(uniqueDomains);
      
      // Enhance script data with website and user info
      const enhancedScripts = scriptData?.map(script => {
        const website = websiteMap.get(script.website_id);
        const profile = profileMap.get(script.user_id);
        
        // Determine category based on script_id or default to 'custom'
        // This is a simplified approach - in a real app, you'd have proper category data
        let category = 'custom';
        if (script.script_id.includes('ga') || script.script_id.includes('google')) {
          category = 'analytics';
        } else if (script.script_id.includes('fb') || script.script_id.includes('ad')) {
          category = 'advertising';
        } else if (script.script_id.includes('social') || script.script_id.includes('twitter')) {
          category = 'social';
        } else if (script.script_id.includes('func') || script.script_id.includes('util')) {
          category = 'functional';
        }
        
        return {
          ...script,
          user_full_name: profile?.full_name,
          user_email: userEmailMap.get(script.user_id) || `user-${script.user_id.substring(0, 6)}@example.com`,
          website_domain: website?.domain,
          website_name: website?.name,
          category,
          active: website?.active ?? true
        };
      }) || [];
      
      if (enhancedScripts.length === 0) {
        // If no data, use mock data
        console.log("No scripts found, using mock data");
        setScripts(mockScripts);
      } else {
        console.log("Enhanced scripts:", enhancedScripts);
        setScripts(enhancedScripts);
      }
    } catch (error: any) {
      console.error("Error in fetchScripts:", error);
      toast.error(`Failed to load scripts: ${error.message}`);
      setScripts(mockScripts); // Use mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  const filterScripts = () => {
    let filtered = [...scripts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        script => 
          (script.script_id && script.script_id.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (script.website_domain && script.website_domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (script.user_email && script.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (script.user_full_name && script.user_full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(script => script.category === selectedCategory);
    }
    
    // Apply domain filter
    if (selectedDomain) {
      filtered = filtered.filter(script => script.website_domain === selectedDomain);
    }
    
    setFilteredScripts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateScripts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedScripts(filteredScripts.slice(startIndex, endIndex));
  };

  const toggleScriptStatus = async (scriptId: string, websiteId: string, currentActiveState: boolean) => {
    try {
      setUpdatingScript(scriptId);
      
      // Update the website's active status
      const { error } = await supabase
        .from('websites')
        .update({ active: !currentActiveState })
        .eq('id', websiteId);
      
      if (error) throw error;
      
      // If successful, update local state
      setScripts(prevScripts => 
        prevScripts.map(script => 
          script.id === scriptId 
            ? { ...script, active: !currentActiveState } 
            : script
        )
      );
      
      toast.success(`Script ${!currentActiveState ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error("Error toggling script status:", error);
      toast.error(`Failed to update script status: ${error.message}`);
    } finally {
      setUpdatingScript(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1} 
          onClick={() => changePage(1)}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if necessary
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i < totalPages) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i} 
              onClick={() => changePage(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    // Show ellipsis if necessary
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages} 
            onClick={() => changePage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Consent Script Management</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Scripts</CardTitle>
            <CardDescription>
              View and manage all consent scripts across all users and domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, domain, or user..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select 
                  onValueChange={(value) => setSelectedDomain(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Domains</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Scripts Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Script ID</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedScripts.map((script) => (
                      <TableRow key={script.id} className={!script.active ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">{script.script_id}</TableCell>
                        <TableCell>
                          {script.website_domain || 'N/A'}
                          {script.website_name && <div className="text-xs text-gray-500">{script.website_name}</div>}
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${script.category === 'analytics'
                                ? 'bg-blue-100 text-blue-800' 
                                : script.category === 'advertising'
                                ? 'bg-yellow-100 text-yellow-800'
                                : script.category === 'social'
                                ? 'bg-purple-100 text-purple-800'
                                : script.category === 'functional'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {script.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          {script.user_full_name || 'Unknown user'}
                          {script.user_email && <div className="text-xs text-gray-500">{script.user_email}</div>}
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${script.active
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {script.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(script.created_at)}</TableCell>
                        <TableCell>
                          <Button 
                            variant={script.active ? "destructive" : "outline"} 
                            size="sm"
                            onClick={() => toggleScriptStatus(script.id, script.website_id, script.active || false)}
                            disabled={updatingScript === script.id}
                            className={!script.active ? "border-green-200 text-green-600 hover:bg-green-50" : ""}
                          >
                            {updatingScript === script.id 
                              ? 'Processing...' 
                              : script.active 
                                ? 'Deactivate' 
                                : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredScripts.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No scripts found
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Loading scripts...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Items per page:</span>
                  <Select 
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  <span className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredScripts.length)} - {Math.min(currentPage * itemsPerPage, filteredScripts.length)} of {filteredScripts.length}
                  </span>
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => changePage(currentPage - 1)}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                      />
                    </PaginationItem>
                    
                    {renderPagination()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => changePage(currentPage + 1)}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminScriptsPage;
