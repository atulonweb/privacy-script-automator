
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
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Domain {
  id: string;
  domain: string;
  name: string;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  last_seen: string | null;
  total_consent_events: number;
  users_seen: number;
  script_status: 'configured' | 'missing' | 'partial';
  connected_user_id: string;
  connected_user_email: string;
  connected_user_name: string;
  created_at: string;
  last_script_update: string | null;
  plan_type: 'free' | 'pro' | 'enterprise';
  usage_warnings: string[];
  geo_distribution: {
    eu: number;
    us: number;
    other: number;
  };
}

// Mock data for initial development
const mockDomains: Domain[] = [
  {
    id: '1',
    domain: 'example.com',
    name: 'Example Website',
    status: 'active',
    last_seen: new Date().toISOString(),
    total_consent_events: 15243,
    users_seen: 8764,
    script_status: 'configured',
    connected_user_id: 'user1',
    connected_user_email: 'user1@example.com',
    connected_user_name: 'John Doe',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    last_script_update: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    plan_type: 'pro',
    usage_warnings: [],
    geo_distribution: { eu: 40, us: 35, other: 25 }
  },
  {
    id: '2',
    domain: 'store.example.com',
    name: 'Example Store',
    status: 'active',
    last_seen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    total_consent_events: 7821,
    users_seen: 4312,
    script_status: 'partial',
    connected_user_id: 'user1',
    connected_user_email: 'user1@example.com',
    connected_user_name: 'John Doe',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    last_script_update: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    plan_type: 'pro',
    usage_warnings: ['Missing analytics script'],
    geo_distribution: { eu: 30, us: 50, other: 20 }
  },
  {
    id: '3',
    domain: 'blog.example.org',
    name: 'Example Blog',
    status: 'inactive',
    last_seen: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    total_consent_events: 2134,
    users_seen: 1852,
    script_status: 'missing',
    connected_user_id: 'user2',
    connected_user_email: 'user2@example.org',
    connected_user_name: 'Jane Smith',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
    last_script_update: null,
    plan_type: 'free',
    usage_warnings: ['No consent events in 30+ days', 'Scripts not configured'],
    geo_distribution: { eu: 60, us: 25, other: 15 }
  },
  {
    id: '4',
    domain: 'app.example.io',
    name: 'Example Application',
    status: 'pending',
    last_seen: null,
    total_consent_events: 0,
    users_seen: 0,
    script_status: 'missing',
    connected_user_id: 'user3',
    connected_user_email: 'user3@example.io',
    connected_user_name: 'Bob Johnson',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    last_script_update: null,
    plan_type: 'free',
    usage_warnings: ['Domain verification pending', 'Scripts not configured'],
    geo_distribution: { eu: 0, us: 0, other: 0 }
  },
  {
    id: '5',
    domain: 'enterprise.example.com',
    name: 'Enterprise Portal',
    status: 'active',
    last_seen: new Date().toISOString(),
    total_consent_events: 53421,
    users_seen: 24689,
    script_status: 'configured',
    connected_user_id: 'user4',
    connected_user_email: 'user4@enterprise.com',
    connected_user_name: 'Alice Williams',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
    last_script_update: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    plan_type: 'enterprise',
    usage_warnings: [],
    geo_distribution: { eu: 35, us: 40, other: 25 }
  }
];

const AdminDomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [scriptFilter, setScriptFilter] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [paginatedDomains, setPaginatedDomains] = useState<Domain[]>([]);

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    filterDomains();
  }, [searchTerm, statusFilter, scriptFilter, domains]);

  useEffect(() => {
    paginateDomains();
  }, [filteredDomains, currentPage, itemsPerPage]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      
      // Attempt to fetch real data from Supabase
      const { data: websites, error: websitesError } = await supabase
        .from('websites')
        .select('*');
      
      if (websitesError) {
        console.error("Error fetching websites:", websitesError);
        throw websitesError;
      }
      
      // Fetch scripts to determine script status
      const { data: scripts, error: scriptsError } = await supabase
        .from('consent_scripts')
        .select('*');
      
      if (scriptsError) {
        console.error("Error fetching scripts:", scriptsError);
        throw scriptsError;
      }
      
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
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
      
      // TODO: Fetch analytics data if available
      // This would be real data from your analytics table
      
      if (websites && websites.length > 0) {
        // Transform website data to domain format
        const transformedDomains: Domain[] = websites.map(website => {
          // Find all scripts for this website
          const websiteScripts = scripts?.filter(script => script.website_id === website.id) || [];
          
          // Determine script status
          let scriptStatus: 'configured' | 'missing' | 'partial' = 'missing';
          if (websiteScripts.length > 0) {
            scriptStatus = websiteScripts.length >= 3 ? 'configured' : 'partial';
          }
          
          // Find user profile
          const profile = profiles?.find(p => p.id === website.user_id);
          
          // Generate some mock statistics based on available data
          // In a real app, you'd get this from your analytics table
          const daysSinceCreation = Math.floor((Date.now() - new Date(website.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const mockConsentEvents = Math.floor(Math.random() * 100) * daysSinceCreation;
          const mockUsersSeen = Math.floor(mockConsentEvents * 0.7);
          
          // Generate warnings
          const warnings: string[] = [];
          if (scriptStatus === 'missing') {
            warnings.push('Scripts not configured');
          } else if (scriptStatus === 'partial') {
            warnings.push('Some scripts missing');
          }
          
          if (!website.active) {
            warnings.push('Website is inactive');
          }
          
          return {
            id: website.id,
            domain: website.domain,
            name: website.name,
            status: website.active ? 'active' : 'inactive' as any,
            last_seen: websiteScripts.length > 0 
              ? new Date(Math.max(...websiteScripts.map(s => new Date(s.updated_at).getTime()))).toISOString()
              : null,
            total_consent_events: mockConsentEvents,
            users_seen: mockUsersSeen,
            script_status: scriptStatus,
            connected_user_id: website.user_id,
            connected_user_email: userEmailMap.get(website.user_id) || 'unknown@example.com',
            connected_user_name: profile?.full_name || 'Unknown User',
            created_at: website.created_at,
            last_script_update: websiteScripts.length > 0
              ? new Date(Math.max(...websiteScripts.map(s => new Date(s.updated_at).getTime()))).toISOString()
              : null,
            plan_type: 'free' as any,  // Assuming default plan
            usage_warnings: warnings,
            geo_distribution: { 
              eu: Math.floor(Math.random() * 40) + 20, 
              us: Math.floor(Math.random() * 40) + 20,
              other: 0 // Will calculate below
            }
          };
        });
        
        // Calculate the "other" percentage for geo distribution
        transformedDomains.forEach(domain => {
          domain.geo_distribution.other = 100 - domain.geo_distribution.eu - domain.geo_distribution.us;
          if (domain.geo_distribution.other < 0) domain.geo_distribution.other = 0;
        });
        
        console.log("Transformed domains:", transformedDomains);
        setDomains(transformedDomains);
      } else {
        console.log("No websites found, using mock data");
        setDomains(mockDomains);
      }
      
    } catch (error: any) {
      console.error("Error in fetchDomains:", error);
      toast.error(`Failed to load domains: ${error.message}`);
      setDomains(mockDomains);
    } finally {
      setLoading(false);
    }
  };

  const filterDomains = () => {
    let filtered = [...domains];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        domain => 
          domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
          domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          domain.connected_user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          domain.connected_user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(domain => domain.status === statusFilter);
    }
    
    // Apply script status filter
    if (scriptFilter) {
      filtered = filtered.filter(domain => domain.script_status === scriptFilter);
    }
    
    setFilteredDomains(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const paginateDomains = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedDomains(filteredDomains.slice(startIndex, endIndex));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 86400)} days ago`;
    if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)} months ago`;
    return `${Math.floor(diffSeconds / 31536000)} years ago`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScriptStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScriptStatusText = (status: string) => {
    switch (status) {
      case 'configured':
        return 'Fully Configured';
      case 'missing':
        return 'No Scripts';
      case 'partial':
        return 'Partially Configured';
      default:
        return 'Unknown';
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Domain Analytics</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Registered Domains</CardTitle>
            <CardDescription>
              Monitor domain health, consent activity, and integration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by domain, name, or user..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select 
                  onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select 
                  onValueChange={(value) => setScriptFilter(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Script status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Script Statuses</SelectItem>
                      <SelectItem value="configured">Fully Configured</SelectItem>
                      <SelectItem value="partial">Partially Configured</SelectItem>
                      <SelectItem value="missing">No Scripts</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Domains Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Consent Events</TableHead>
                      <TableHead>Script Status</TableHead>
                      <TableHead>Connected User</TableHead>
                      <TableHead>Geo Distribution</TableHead>
                      <TableHead>Warnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDomains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{domain.domain}</div>
                            <div className="text-xs text-muted-foreground">{domain.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">Created: {formatDate(domain.created_at)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(domain.status)}`}>
                            {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {domain.last_seen 
                            ? <span className="text-sm">{formatTimeAgo(domain.last_seen)}</span>
                            : <span className="text-sm text-muted-foreground">No activity</span>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{domain.total_consent_events.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{domain.users_seen.toLocaleString()} users</div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  {getScriptStatusIcon(domain.script_status)}
                                  <span>{getScriptStatusText(domain.script_status)}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {domain.script_status === 'configured' 
                                  ? 'All necessary scripts are configured'
                                  : domain.script_status === 'missing'
                                  ? 'No consent scripts have been configured'
                                  : 'Some consent scripts are configured but not all required categories'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          {domain.last_script_update && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Updated: {formatTimeAgo(domain.last_script_update)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{domain.connected_user_name}</div>
                          <div className="text-xs text-muted-foreground">{domain.connected_user_email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>EU:</span>
                              <span className="font-medium">{domain.geo_distribution.eu}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>US:</span>
                              <span className="font-medium">{domain.geo_distribution.us}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Other:</span>
                              <span className="font-medium">{domain.geo_distribution.other}%</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {domain.usage_warnings.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {domain.usage_warnings.map((warning, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-800"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {warning}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-green-600">No issues</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredDomains.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No domains found
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          Loading domains...
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
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDomains.length) || 0} - {Math.min(currentPage * itemsPerPage, filteredDomains.length)} of {filteredDomains.length}
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

export default AdminDomainsPage;
