
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type Website = {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  visitor_count?: number;  // Added property
  accept_rate?: number;    // Added property
};

export function useWebsites() {
  const { user, isAdmin } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('websites').select('*');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setWebsites(data || []);
    } catch (err: any) {
      console.error('Error fetching websites:', err);
      setError(err.message);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const addWebsite = async (name: string, domain: string) => {
    try {
      const { data, error } = await supabase.from('websites').insert({
        name,
        domain,
        user_id: user?.id
      }).select();
      
      if (error) throw error;
      
      toast.success('Website added successfully');
      await fetchWebsites();
      return data[0];
    } catch (err: any) {
      console.error('Error adding website:', err);
      toast.error(err.message || 'Failed to add website');
      throw err;
    }
  };

  const updateWebsiteStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('websites')
        .update({ active })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Website status updated');
      await fetchWebsites();
    } catch (err: any) {
      console.error('Error updating website status:', err);
      toast.error(err.message || 'Failed to update website status');
      throw err;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Website deleted');
      await fetchWebsites();
    } catch (err: any) {
      console.error('Error deleting website:', err);
      toast.error(err.message || 'Failed to delete website');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  return {
    websites,
    loading,
    error,
    fetchWebsites,
    addWebsite,
    updateWebsiteStatus,
    deleteWebsite
  };
}
