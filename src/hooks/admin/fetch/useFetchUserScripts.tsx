
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Script } from '@/components/admin/UserScriptsTable';

export function useFetchUserScripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  
  const fetchUserScripts = async (userId: string) => {
    try {
      // Fetch user's scripts
      const { data: scriptsData, error: scriptsError } = await supabase
        .from('consent_scripts')
        .select('*')
        .eq('user_id', userId);
      
      if (scriptsError) throw scriptsError;
      console.log("Fetched scripts:", scriptsData);
      
      setScripts(scriptsData || []);
      return scriptsData || [];
    } catch (error: any) {
      console.error("Error fetching user scripts:", error);
      toast.error(`Failed to load scripts: ${error.message}`);
      throw error;
    }
  };
  
  return {
    scripts,
    setScripts,
    fetchUserScripts
  };
}
