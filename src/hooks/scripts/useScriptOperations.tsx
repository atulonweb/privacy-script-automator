
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ConsentScript } from '@/types/script.types';

export function useScriptOperations(fetchScripts: () => Promise<void>) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const addScript = async (scriptData: Omit<ConsentScript, 'id' | 'created_at' | 'user_id'>) => {
    try {
      setLoading(true);
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a script"
        });
        throw new Error('User not authenticated');
      }
      
      console.log('Adding script with data:', { ...scriptData, user_id: user.id });
      
      // Create the new script object with all required fields
      const newScript = {
        ...scriptData,
        user_id: user.id
      };
      
      // Log the exact payload being sent to Supabase
      console.log('Exact payload being sent to Supabase:', JSON.stringify(newScript, null, 2));
      
      // Send the data to Supabase
      const { data, error } = await supabase
        .from('consent_scripts')
        .insert(newScript)
        .select();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Supabase response after insert:', data);
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create script: No data returned');
      }
      
      // Refresh the scripts list
      await fetchScripts();
      
      toast({
        title: "Success",
        description: "Script created successfully"
      });
      return data[0];
    } catch (err: any) {
      console.error('Error creating script:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create script"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateScript = async (id: string, scriptData: Partial<ConsentScript>) => {
    try {
      setLoading(true);
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update a script"
        });
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('consent_scripts')
        .update({
          ...scriptData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await fetchScripts();
      
      toast({
        title: "Success",
        description: "Script updated successfully"
      });
      return true;
    } catch (err: any) {
      console.error('Error updating script:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update script"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteScript = async (id: string) => {
    try {
      setLoading(true);
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a script"
        });
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('consent_scripts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await fetchScripts();
      
      toast({
        title: "Success",
        description: "Script deleted successfully"
      });
      return true;
    } catch (err: any) {
      console.error('Error deleting script:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete script"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addScript,
    updateScript,
    deleteScript
  };
}
