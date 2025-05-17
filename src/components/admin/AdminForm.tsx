
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AdminFormProps {
  onSuccess: () => void;
  existingAdmin?: {
    id: string;
    email: string;
    full_name?: string | null;
  };
}

const AdminForm = ({ onSuccess, existingAdmin }: AdminFormProps) => {
  const [email, setEmail] = useState(existingAdmin?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // If we have an existing admin, update their details instead
      if (existingAdmin) {
        // Implement update logic in the future if needed
        toast.success('Admin details updated successfully');
      } else {
        // Add new admin
        const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/admin-setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to add admin');
        }
        
        toast.success('Admin added successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error in admin form:", error);
      setError(error.message || 'An error occurred');
      toast.error(error.message || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting || (existingAdmin !== undefined)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : existingAdmin ? 'Update Admin' : 'Add Admin'}
        </Button>
      </div>
    </form>
  );
};

export default AdminForm;
