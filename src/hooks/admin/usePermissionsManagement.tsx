
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminManagement } from './useAdminManagement';

export function usePermissionsManagement() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchAdmins, handleAdminAdded } = useAdminManagement();

  const handleAssignAdminRole = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the Supabase Edge Function to make the user an admin
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign admin role');
      }

      // Success
      toast.success(`Admin role assigned to ${email}`, {
        description: 'The user now has admin privileges',
      });
      
      setEmail(''); // Reset form
      handleAdminAdded(); // Refresh the admin list
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast.error('Failed to assign admin role', {
        description: error.message || 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    isSubmitting,
    handleAssignAdminRole,
  };
}
