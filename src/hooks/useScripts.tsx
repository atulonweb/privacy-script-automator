
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type ConsentScript = {
  id: string;
  website_id: string;
  script_id: string;
  banner_position: string;
  banner_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  show_powered_by: boolean;
  auto_hide: boolean;
  auto_hide_time: number;
  created_at: string;
  user_id: string;
};

export function useScripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ConsentScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setScripts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('consent_scripts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setScripts(data || []);
    } catch (err: any) {
      console.error('Error fetching scripts:', err);
      setError(err.message);
      toast.error('Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  const addScript = async (scriptData: Omit<ConsentScript, 'id' | 'created_at' | 'user_id'>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to create a script');
        throw new Error('User not authenticated');
      }
      
      console.log('Adding script with data:', { ...scriptData, user_id: user.id });
      
      const { data, error } = await supabase
        .from('consent_scripts')
        .insert({
          ...scriptData,
          user_id: user.id,
        })
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create script: No data returned');
      }
      
      toast.success('Script created successfully');
      await fetchScripts();
      return data[0];
    } catch (err: any) {
      console.error('Error creating script:', err);
      toast.error(err.message || 'Failed to create script');
      throw err;
    }
  };

  const updateScript = async (id: string, scriptData: Partial<ConsentScript>) => {
    try {
      if (!user) {
        toast.error('You must be logged in to update a script');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('consent_scripts')
        .update(scriptData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Script updated successfully');
      await fetchScripts();
    } catch (err: any) {
      console.error('Error updating script:', err);
      toast.error(err.message || 'Failed to update script');
      throw err;
    }
  };

  const deleteScript = async (id: string) => {
    try {
      if (!user) {
        toast.error('You must be logged in to delete a script');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('consent_scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Script deleted successfully');
      await fetchScripts();
    } catch (err: any) {
      console.error('Error deleting script:', err);
      toast.error(err.message || 'Failed to delete script');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchScripts();
    } else {
      setScripts([]);
      setLoading(false);
    }
  }, [user]);

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    addScript,
    updateScript,
    deleteScript
  };
}
