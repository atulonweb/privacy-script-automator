
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

  // Fetch all consent logs and apply filters
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
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
        setError(err instanceof Error ? err.message : 'An error occurred while fetching logs');
        console.error('Error fetching consent logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [dateRange, domain, eventType, region]);

  // Fetch unique domains for filter dropdown
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // Fix: Use a different approach to get distinct domains since `.distinct()` is not available
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
