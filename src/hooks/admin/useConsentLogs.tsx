
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export type ConsentLog = {
  id: string;
  event_type: string;
  domain: string;
  url?: string;
  visitor_id?: string;
  session_id?: string;
  region?: string;
  language?: string;
  user_agent?: string;
  created_at: string;
};

type UseConsentLogsProps = {
  dateRange?: [Date | undefined, Date | undefined];
  domain?: string | null;
  eventType?: string | null;
  region?: string | null;
};

export const useConsentLogs = ({ 
  dateRange, 
  domain, 
  eventType, 
  region 
}: UseConsentLogsProps) => {
  const [logs, setLogs] = useState<ConsentLog[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all consent logs and apply filters
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if we have admin access
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        
        if (isAdminError) {
          console.error('Error checking admin status:', isAdminError);
        }
        
        if (!isAdminData && !isAdminError) {
          setError('You need admin privileges to view consent logs');
          setIsLoading(false);
          return;
        }

        let query = supabase
          .from('domain_activity')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (dateRange && dateRange[0] && dateRange[1]) {
          const startDate = format(dateRange[0], 'yyyy-MM-dd');
          const endDate = format(dateRange[1], 'yyyy-MM-dd');
          query = query.gte('created_at', startDate).lte('created_at', endDate);
        }

        if (domain) {
          query = query.eq('domain', domain);
        }

        if (eventType) {
          query = query.eq('event_type', eventType);
        }

        if (region) {
          query = query.eq('region', region);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setLogs(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching logs';
        setError(errorMessage);
        console.error('Error fetching consent logs:', err);
        
        toast({
          title: "Error loading consent logs",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [dateRange, domain, eventType, region, toast]);

  // Fetch unique domains for filter dropdown
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // Check if we have admin access first
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
        
        if (isAdminError || !isAdminData) {
          console.error('Error checking admin status or not an admin:', isAdminError);
          return;
        }
        
        const { data, error: domainError } = await supabase
          .from('domain_activity')
          .select('domain');

        if (domainError) {
          throw new Error(domainError.message);
        }

        // Extract unique domains manually using Set
        const uniqueDomains = Array.from(new Set(data?.map(item => item.domain) || []));
        setDomains(uniqueDomains);
      } catch (err) {
        console.error('Error fetching domains:', err);
        // Don't set error state here as it would override the main error message
      }
    };

    fetchDomains();
  }, []);

  return {
    logs,
    domains,
    isLoading,
    error
  };
};
