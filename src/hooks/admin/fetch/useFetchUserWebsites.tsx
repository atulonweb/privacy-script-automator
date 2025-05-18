
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Website } from '@/components/admin/UserWebsitesTable';

export function useFetchUserWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  
  const fetchUserWebsites = async (userId: string) => {
    try {
      // Fetch user's websites
      const { data: websitesData, error: websitesError } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', userId);
      
      if (websitesError) throw websitesError;
      console.log("Fetched websites:", websitesData);
      
      setWebsites(websitesData || []);
      return websitesData || [];
    } catch (error: any) {
      console.error("Error fetching user websites:", error);
      toast.error(`Failed to load websites: ${error.message}`);
      throw error;
    }
  };
  
  return {
    websites,
    setWebsites,
    fetchUserWebsites
  };
}
