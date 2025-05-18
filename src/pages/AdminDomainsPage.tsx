import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, Clock, InfoIcon } from 'lucide-react';
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useWebsites } from '@/hooks/useWebsites';
import { formatDistance } from 'date-fns';

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

const AdminDomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [scriptFilter, setScriptFilter] = useState<string | null>(null);
  const [showDataSourceInfo, setShowDataSourceInfo] = useState<boolean>(false);
  
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
      
      // Fetch websites from Supabase
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
      
      // Try to fetch analytics data if available
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .order('date', { ascending: false });
      
      if (analyticsError) {
        console.error("Error fetching analytics:", analyticsError);
        // Non-fatal error, continue with what we have
      }

      // Try to fetch user emails from admin function
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
      
      if (websites && websites.length > 0) {
        // Transform website data to domain format
        const transformedDomains: Domain[] = websites.map(website => {
          // Find all scripts for this website
          const websiteScripts = scripts?.filter(script => script.website_id === website.id) || [];
          
          // Find analytics data for this website's scripts
          let websiteAnalytics = [];
          if (analytics) {
            const scriptIds = websiteScripts.map(script => script.id);
            websiteAnalytics = analytics.filter(a => scriptIds.includes(a.script_id));
          }
          
          // Determine script status
          let scriptStatus: 'configured' | 'missing' | 'partial' = 'missing';
          if (websiteScripts.length > 0) {
            scriptStatus = websiteScripts.length >= 3 ? 'configured' : 'partial';
          }
          
          // Find user profile
          const profile = profiles?.find(p => p.id === website.user_id);
          
          // Generate actual or mock consent event data
          let totalConsentEvents = 0;
          let acceptCount = 0;
          let rejectCount = 0;
          let partialCount = 0;
          
          if (websiteAnalytics.length > 0) {
            // We have real analytics data
            websiteAnalytics.forEach(a => {
              totalConsentEvents += (a.accept_count || 0) + (a.reject_count || 0) + (a.partial_count || 0);
              acceptCount += a.accept_count || 0;
              rejectCount += a.reject_count || 0;
              partialCount += a.partial_count || 0;
            });
          } else {
            // Generate mock data since we don't have real analytics
            const daysSinceCreation = Math.floor((Date.now() - new Date(website.created_at).getTime()) / (1000 * 60 * 60 * 24));
            totalConsentEvents = Math.floor(Math.random() * 100) * (daysSinceCreation || 1);
          }
          
          // Calculate or estimate users seen
          // In a real system, this would come from unique visitor tracking
          const mockUsersSeen = Math.floor(totalConsentEvents * 0.7);
          
          // Generate warnings based on actual data
          const warnings: string[] = [];
          if (scriptStatus === 'missing') {
            warnings.push('Scripts not configured');
          } else if (scriptStatus === 'partial') {
            warnings.push('Some scripts missing');
          }
          
          if (!website.active) {
            warnings.push('Website is inactive');
          }
          
          // In a real system, check for last activity
          if (websiteScripts.length > 0 && !websiteAnalytics.length) {
            warnings.push('No consent events recorded');
          }
          
          // Get last seen timestamp
          let lastSeen = null;
          if (websiteAnalytics.length > 0) {
            // Use the most recent analytics entry date
            lastSeen = new Date(Math.max(...websiteAnalytics.map(a => new Date(a.created_at).getTime()))).toISOString();
          } else if (websiteScripts.length > 0) {
            // Fallback to most recent script update time
            lastSeen = new Date(Math.max(...websiteScripts.map(s => new Date(s.updated_at).getTime()))).toISOString();
          }
          
          // Mock geo distribution - in real system would come from analytics with IP geolocation
          const geoDistribution = { 
            eu: Math.floor(Math.random() * 40) + 20, 
            us: Math.floor(Math.random() * 40) + 20,
            other: 0 // Will calculate below
          };
          
          // Calculate the "other" percentage
          geoDistribution.other = 100 - geoDistribution.eu - geoDistribution.us;
          if (geoDistribution.other < 0) geoDistribution.other = 0;
          
          return {
            id: website.id,
            domain: website.domain,
            name: website.name,
            status: website.active ? 'active' : 'inactive' as any,
            last_seen: lastSeen,
            total_consent_events: totalConsentEvents,
            users_seen: mockUsersSeen,
            script_status: scriptStatus,
            connected_user_id: website.user_id,
            connected_user_email: userEmailMap.get(website.user_id) || 'unknown@example.com',
            connected_user_name: profile?.full_name || 'Unknown User',
            created_at: website.created_at,
            last_script_update: websiteScripts.length > 0
              ? new Date(Math.max(...websiteScripts.map(s => new Date(s.updated_at).getTime()))).toISOString()
              : null,
            plan_type: 'free' as any,  // Would come from user's subscription plan in real system
            usage_warnings: warnings,
            geo_distribution: geoDistribution
          };
        });
        
        console.log("Transformed domains:", transformedDomains);
        setDomains(transformedDomains);
      } else {
        console.log("No websites found");
        setDomains([]);
      }
      
    } catch (error: any) {
      console.error("Error in fetchDomains:", error);
      toast.error(`Failed to load domains: ${error.message}`);
      setDomains([]);
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
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      return formatDistance(date, now, { addSuffix: true });
    } catch (err) {
      return 'Invalid date';
    }
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
          <Button 
            variant="outline" 
            onClick={() => setShowDataSourceInfo(!showDataSourceInfo)}
            className="flex items-center gap-2"
          >
            <InfoIcon className="h-4 w-4" />
            {showDataSourceInfo ? 'Hide Data Source Info' : 'Show Data Source Info'}
          </Button>
        </div>
        
        {showDataSourceInfo && (
          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-900">Data Source Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-blue-800">
                <div>
                  <h3 className="font-semibold mb-2">Real Data (Currently Available):</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Domain Name & Website Info (from websites table)</li>
                    <li>Active/Inactive Status (from websites table)</li>
                    <li>Created At Date (from websites table)</li>
                    <li>Connected User (from users and profiles tables)</li>
                    <li>Script Status (from consent_scripts table)</li>
                    <li>Last Script Update (from consent_scripts table)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Simulated Data (Needs Implementation):</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><Badge className="bg-yellow-200 text-yellow-900">Simulated</Badge> Last Seen/Ping - Needs cg.js to log timestamps when loaded</li>
                    <li><Badge className="bg-yellow-200 text-yellow-900">Simulated</Badge> Consent Events - Needs analytics table with script_id reference</li>
                    <li><Badge className="bg-yellow-200 text-yellow-900">Simulated</Badge> Users Seen - Needs unique visitor tracking in analytics</li>
                    <li><Badge className="bg-yellow-200 text-yellow-900">Simulated</Badge> Geo Distribution - Needs IP geolocation in analytics</li>
                    <li><Badge className="bg-yellow-200 text-yellow-900">Simulated</Badge> Plan Type - Needs subscription/plan data in user or website metadata</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How to Implement Missing Data:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Last Seen/Ping: Modify CDN module data.js to log timestamps when loaded</li>
                    <li>Consent Events: Enhance analytics logging in CDN module</li>
                    <li>Users Seen: Add unique visitor tracking using anonymous IDs or fingerprinting</li>
                    <li>Geo Distribution: Add IP geolocation to analytics logging</li>
                    <li>Plan Type: Add subscription management to user accounts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" onClick={() => setShowDataSourceInfo(false)}>Close</Button>
            </CardFooter>
          </Card>
        )}
        
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
                <Button onClick={fetchDomains} variant="outline">Refresh Data</Button>
              </div>
              
              {/* Domains Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1">
                              Last Activity
                              {showDataSourceInfo && <Badge className="bg-yellow-200 text-yellow-900 ml-1">Partial</Badge>}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Currently based on script update time or analytics if available. Should be updated each time cg.js loads.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1">
                              Consent Events
                              {showDataSourceInfo && <Badge className="bg-yellow-200 text-yellow-900 ml-1">Simulated</Badge>}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Currently simulated. Will come from actual analytics table in production.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead>Script Status</TableHead>
                      <TableHead>Connected User</TableHead>
                      <TableHead>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1">
                              Geo Distribution
                              {showDataSourceInfo && <Badge className="bg-yellow-200 text-yellow-900 ml-1">Simulated</Badge>}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Currently randomized. Will need IP geolocation added to analytics.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
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
                            ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="text-sm">{formatTimeAgo(domain.last_seen)}</TooltipTrigger>
                                  <TooltipContent>
                                    <p>{new Date(domain.last_seen).toLocaleString()}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )
                            : <span className="text-sm text-muted-foreground">No activity</span>
                          }
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-help">
                                <div className="text-sm">{domain.total_consent_events.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{domain.users_seen.toLocaleString()} users</div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Consent Event Details</h4>
                                {showDataSourceInfo && (
                                  <div className="text-xs text-amber-600">
                                    This data is currently simulated. It will come from the actual analytics table in production.
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <div className="text-muted-foreground">Total Events:</div>
                                  <div className="font-medium">{domain.total_consent_events.toLocaleString()}</div>
                                  <div className="text-muted-foreground">Estimated Users:</div>
                                  <div className="font-medium">{domain.users_seen.toLocaleString()}</div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
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
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex flex-col gap-1 cursor-help">
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
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Geographic Distribution</h4>
                                {showDataSourceInfo && (
                                  <div className="text-xs text-amber-600">
                                    This data is currently randomized. IP geolocation tracking needs to be added to analytics.
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">European Union</span>
                                    <span className="font-medium">{domain.geo_distribution.eu}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${domain.geo_distribution.eu}%` }}></div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">United States</span>
                                    <span className="font-medium">{domain.geo_distribution.us}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${domain.geo_distribution.us}%` }}></div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">Other Regions</span>
                                    <span className="font-medium">{domain.geo_distribution.other}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${domain.geo_distribution.other}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
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

        <Card>
          <CardHeader>
            <CardTitle>Data Implementation Guide</CardTitle>
            <CardDescription>
              How to collect real data for this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Core Data Collection Methods</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">1</div>
                      <div>
                        <span className="font-medium">Last Seen / Ping</span>
                        <p className="text-sm text-gray-600">Modify lib/cdn/modules/data.js to log a timestamp each time cg.js is loaded from a domain</p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">2</div>
                      <div>
                        <span className="font-medium">Consent Events</span>
                        <p className="text-sm text-gray-600">Enhance analytics.js to log user actions into your analytics table with script_id reference</p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">3</div>
                      <div>
                        <span className="font-medium">Script Status</span>
                        <p className="text-sm text-gray-600">Create logic to check if all required categories have at least one script configured</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Advanced Data Collection</h3>
                  <ul className="space-y-3">
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">4</div>
                      <div>
                        <span className="font-medium">Unique Visitors</span>
                        <p className="text-sm text-gray-600">Add anonymous ID fingerprinting to track unique users in the analytics library</p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">5</div>
                      <div>
                        <span className="font-medium">Geo Distribution</span>
                        <p className="text-sm text-gray-600">Add IP geolocation lookup when logging analytics events</p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">6</div>
                      <div>
                        <span className="font-medium">Usage Warnings</span>
                        <p className="text-sm text-gray-600">Implement background jobs to run checks on domains and identify issues</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Next Steps for Implementation</h3>
                <div className="bg-gray-50 p-4 rounded-md border text-sm">
                  <pre className="whitespace-pre-wrap">
{`// Example modifications to lib/cdn/modules/data.js to log activity
export async function fetchConfig() {
  try {
    // ... existing code ...
    
    // Add activity logging
    await logDomainActivity();
    
    return config;
  } catch (error) {
    console.error('ConsentGuard: Error fetching configuration', error);
    return config; // Return default config on error
  }
}

// New function to log domain activity
async function logDomainActivity() {
  try {
    const domain = window.location.hostname;
    const scriptId = getScriptId();
    
    await fetch(\`\${API_ENDPOINT}/activity\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        scriptId,
        timestamp: new Date().toISOString(),
        // Use navigator.language for rough locale data
        locale: navigator.language,
        // Could use a geolocation service here
        country: 'unknown' // To be determined server-side
      })
    });
  } catch (error) {
    // Silent fail - don't block page load for analytics
    console.error('ConsentGuard: Error logging domain activity', error);
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDomainsPage;
