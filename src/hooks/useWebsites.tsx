
import { useState, useEffect, useCallback } from 'react';
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
  visitor_count?: number;
  accept_rate?: number;
};

export function useWebsites() {
  const { user, isAdmin } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setWebsites([]);
        return;
      }
      
      let query = supabase.from('websites').select('*');
      
      if (!isAdmin) {
        // If not admin, only show user's websites
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Fetched websites:", data);
      setWebsites(data || []);
    } catch (err: any) {
      console.error('Error fetching websites:', err);
      setError(err.message);
      toast.error('Failed to load websites');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const addWebsite = async (name: string, domain: string) => {
    try {
      if (!user) {
        toast.error('You must be logged in to add a website');
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.from('websites').insert({
        name,
        domain,
        user_id: user.id
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
      if (!user) {
        toast.error('You must be logged in to update website status');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('websites')
        .update({ active })
        .eq('id', id)
        .eq('user_id', user.id);
      
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
      if (!user) {
        toast.error('You must be logged in to delete a website');
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('websites')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
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
    } else {
      setWebsites([]);
      setLoading(false);
    }
  }, [user, fetchWebsites]);

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
