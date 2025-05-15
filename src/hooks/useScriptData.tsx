
import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ConsentScript, useScripts } from '@/hooks/useScripts';
import { useWebsites } from '@/hooks/useWebsites';
import { useToast } from '@/hooks/use-toast';

export const useScriptData = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { websites } = useWebsites();
  const { scripts, loading: scriptsLoading, fetchScripts } = useScripts();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Get script data from location state or fetch it if not available
  const [scriptData, setScriptData] = useState<ConsentScript | null>(
    location.state?.scriptData || null
  );
  
  const [websiteName, setWebsiteName] = useState<string>(
    location.state?.websiteName || 'Your Website'
  );

  useEffect(() => {
    // If script data wasn't passed via location state, fetch it using the id
    if (!scriptData && id) {
      const loadScript = async () => {
        setLoading(true);
        await fetchScripts();
        setLoading(false);
      };
      
      loadScript();
    } else {
      setLoading(false);
    }
  }, [id, scriptData, fetchScripts]);
  
  // Find the script after fetching if we didn't have it from location state
  useEffect(() => {
    if (!scriptData && id && scripts.length > 0) {
      const foundScript = scripts.find(script => script.id === id);
      if (foundScript) {
        setScriptData(foundScript);
        
        // Also find the website name
        const website = websites.find(w => w.id === foundScript.website_id);
        if (website) {
          setWebsiteName(website.name);
        }
      } else {
        toast({
          title: "Error",
          description: "Script not found",
          variant: "destructive",
        });
      }
    }
  }, [id, scripts, websites, scriptData, toast]);

  return {
    scriptData,
    websiteName,
    loading,
    scriptsLoading
  };
};
