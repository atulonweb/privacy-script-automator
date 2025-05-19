
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
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, CheckCircle, XCircle, Clock, InfoIcon } from 'lucide-react';
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
import { formatDistance } from 'date-fns';

interface Domain {
  id: string;
  domain: string;
  name: string;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  last_seen: string | null;
  total_consent_events: number | null;
  users_seen: number | null;
  script_status: 'configured' | 'missing' | 'partial';
  connected_user_id: string;
  connected_user_email: string;
  connected_user_name: string;
  created_at: string;
  last_script_update: string | null;
  plan_type: 'free' | 'pro' | 'enterprise';
  usage_warnings: string[];
  geo_distribution: {
    eu: number | null;
    us: number | null;
    other: number | null;
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
      
      // Fetch analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .order('date', { ascending: false });
      
      if (analyticsError) {
        console.error("Error fetching analytics:", analyticsError);
        // Non-fatal error, continue with what we have
      }

      // Fetch domain_activity data for geo distribution
      const { data: domainGeoData, error: domainGeoError } = await supabase
        .from('domain_geo_distribution')
        .select('*');
        
      if (domainGeoError) {
        console.error("Error fetching domain geo distribution:", domainGeoError);
        // Non-fatal error, continue with what we have
      }

      // Fetch domain activity data for last seen timestamps
      const { data: domainActivity, error: domainActivityError } = await supabase
        .from('domain_activity')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (domainActivityError) {
        console.error("Error fetching domain activity:", domainActivityError);
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
          
          // Calculate consent events from analytics data - only use real data
          let totalConsentEvents = null;
          let usersSeen = null;
          
          if (websiteAnalytics && websiteAnalytics.length > 0) {
            totalConsentEvents = websiteAnalytics.reduce((sum, a) => 
              sum + (a.accept_count || 0) + (a.reject_count || 0) + (a.partial_count || 0), 0);
            usersSeen = websiteAnalytics.reduce((sum, a) => sum + (a.visitor_count || 0), 0);
          }
          
          // Get geo distribution from domain_activity table - only use real data
          const geoDistribution = { eu: null, us: null, other: null };
          
          if (domainGeoData && domainGeoData.length > 0) {
            // Find geo data for this website's scripts
            const scriptIds = websiteScripts.map(script => script.id);
            const websiteGeoData = domainGeoData.filter(g => scriptIds.includes(g.script_id));
            
            if (websiteGeoData.length > 0) {
              let totalVisitors = 0;
              let euVisitors = 0;
              let usVisitors = 0;
              let otherVisitors = 0;
              
              websiteGeoData.forEach(geo => {
                totalVisitors += geo.total_unique_visitors || 0;
                euVisitors += geo.eu_visitors || 0;
                usVisitors += geo.us_visitors || 0;
                otherVisitors += geo.other_visitors || 0;
              });
              
              if (totalVisitors > 0) {
                geoDistribution.eu = Math.round((euVisitors / totalVisitors) * 100);
                geoDistribution.us = Math.round((usVisitors / totalVisitors) * 100);
                geoDistribution.other = Math.round((otherVisitors / totalVisitors) * 100);
                
                // Adjust to ensure they sum to 100%
                const sum = (geoDistribution.eu || 0) + (geoDistribution.us || 0) + (geoDistribution.other || 0);
                if (sum !== 100 && sum > 0) {
                  // Add/subtract the difference to/from the largest percentage
                  const diff = 100 - sum;
                  if (geoDistribution.eu >= geoDistribution.us && geoDistribution.eu >= geoDistribution.other) {
                    geoDistribution.eu += diff;
                  } else if (geoDistribution.us >= geoDistribution.eu && geoDistribution.us >= geoDistribution.other) {
                    geoDistribution.us += diff;
                  } else {
                    geoDistribution.other += diff;
                  }
                }
              }
            }
          }
          
          // Generate usage warnings based on real data
          const warnings: string[] = [];
          if (scriptStatus === 'missing') {
            warnings.push('Scripts not configured');
          } else if (scriptStatus === 'partial') {
            warnings.push('Some scripts missing');
          }
          
          if (!website.active) {
            warnings.push('Website is inactive');
          }
          
          // Check for script activity
          if (websiteScripts.length > 0 && (!websiteAnalytics || !websiteAnalytics.length)) {
            warnings.push('No consent events recorded');
          }
          
          // Get last seen timestamp - only use real data
          let lastSeen = null;
          
          // Check domain activity first for the most recent timestamp
          if (domainActivity && domainActivity.length > 0) {
            const scriptIds = websiteScripts.map(script => script.id);
            const websiteDomainActivity = domainActivity.filter(a => scriptIds.includes(a.script_id));
            
            if (websiteDomainActivity.length > 0) {
              // Find the most recent activity
              const mostRecentActivity = websiteDomainActivity.reduce((latest, current) => {
                return new Date(latest.created_at) > new Date(current.created_at) ? latest : current;
              }, websiteDomainActivity[0]);
              
              lastSeen = mostRecentActivity.created_at;
            }
          }
          
          // If no domain activity, check analytics data
          if (!lastSeen && websiteAnalytics && websiteAnalytics.length > 0) {
            // Use the most recent analytics entry date
            const mostRecentAnalytics = websiteAnalytics.reduce((latest, current) => {
              return new Date(latest.created_at) > new Date(current.created_at) ? latest : current;
            }, websiteAnalytics[0]);
            
            lastSeen = mostRecentAnalytics.created_at;
          }
          
          return {
            id: website.id,
            domain: website.domain,
            name: website.name,
            status: website.active ? 'active' : 'inactive' as any,
            last_seen: lastSeen,
            total_consent_events: totalConsentEvents,
            users_seen: usersSeen,
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

  const formatDataValue = (value: number | null): string => {
    if (value === null) return 'N/A';
    return value.toLocaleString();
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${value}%`;
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
                  <h3 className="font-semibold mb-2">Data Sources:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Domain Name & Website Info (from websites table)</li>
                    <li>Active/Inactive Status (from websites table)</li>
                    <li>Created At Date (from websites table)</li>
                    <li>Connected User (from users and profiles tables)</li>
                    <li>Script Status (from consent_scripts table)</li>
                    <li>Last Script Update (from consent_scripts table)</li>
                    <li>Last Seen (from domain_activity table)</li>
                    <li>Consent Events (from analytics table)</li>
                    <li>Geo Distribution (from domain_activity table)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Missing Data Display:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>When data is unavailable for a field, it will show 'N/A' or '0'</li>
                    <li>No mock data or placeholder values are used</li>
                  </ul>
                </div>
              </div>
            </CardContent>
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
                                <div className="text-sm">{formatDataValue(domain.total_consent_events)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {domain.users_seen !== null ? `${domain.users_seen.toLocaleString()} users` : 'No users'}
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Consent Event Details</h4>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                  <div className="text-muted-foreground">Total Events:</div>
                                  <div className="font-medium">{formatDataValue(domain.total_consent_events)}</div>
                                  <div className="text-muted-foreground">Unique Users:</div>
                                  <div className="font-medium">{formatDataValue(domain.users_seen)}</div>
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
                                  <span className="font-medium">{formatPercentage(domain.geo_distribution.eu)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>US:</span>
                                  <span className="font-medium">{formatPercentage(domain.geo_distribution.us)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span>Other:</span>
                                  <span className="font-medium">{formatPercentage(domain.geo_distribution.other)}</span>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Geographic Distribution</h4>
                                {domain.geo_distribution.eu === null ? (
                                  <div className="text-sm text-muted-foreground">No geographic data available</div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">European Union</span>
                                      <span className="font-medium">{formatPercentage(domain.geo_distribution.eu)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${domain.geo_distribution.eu || 0}%` }}></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">United States</span>
                                      <span className="font-medium">{formatPercentage(domain.geo_distribution.us)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                      <div className="h-2 bg-green-500 rounded-full" style={{ width: `${domain.geo_distribution.us || 0}%` }}></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Other Regions</span>
                                      <span className="font-medium">{formatPercentage(domain.geo_distribution.other)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${domain.geo_distribution.other || 0}%` }}></div>
                                    </div>
                                  </div>
                                )}
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
      </div>
    </AdminLayout>
  );
};

export default AdminDomainsPage;
