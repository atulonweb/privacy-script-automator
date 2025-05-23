
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface OptimisticUpdateConfig<T> {
  data: T[];
  setData: (data: T[]) => void;
  itemId: string;
  updates: Partial<T>;
  apiCall: () => Promise<any>;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => Promise<void>;
  cacheKeysToInvalidate?: string[][];
}

export function useAdminDataConsistency() {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const performOptimisticUpdate = useCallback(async <T extends { id: string }>(
    config: OptimisticUpdateConfig<T>
  ) => {
    const {
      data,
      setData,
      itemId,
      updates,
      apiCall,
      successMessage = 'Update successful',
      errorMessage = 'Update failed',
      onSuccess,
      cacheKeysToInvalidate = []
    } = config;

    // Find the current item data for potential revert
    const currentItem = data.find(item => item.id === itemId);
    const originalData = currentItem ? { ...currentItem } : null;
    
    if (!originalData) {
      toast.error('Item not found');
      return false;
    }

    try {
      setIsUpdating(true);
      
      // OPTIMISTIC UPDATE: Immediately update the UI
      setData(data.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
      
      // Call the API
      const result = await apiCall();
      
      if (!result || (result.error)) {
        throw new Error(result?.error || errorMessage);
      }
      
      // Show success message
      toast.success(successMessage);
      
      // Invalidate relevant caches
      for (const cacheKey of cacheKeysToInvalidate) {
        await queryClient.invalidateQueries({ queryKey: cacheKey });
      }
      
      // Call success callback if provided
      if (onSuccess) {
        await onSuccess();
      }
      
      return true;
      
    } catch (error: any) {
      console.error("Error during optimistic update:", error);
      
      // Revert optimistic update on error
      setData(data.map(item => 
        item.id === itemId ? originalData : item
      ));
      
      toast.error(errorMessage, { 
        description: error.message || 'Please try again later'
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  const invalidateCaches = useCallback(async (cacheKeys: string[][]) => {
    for (const cacheKey of cacheKeys) {
      await queryClient.invalidateQueries({ queryKey: cacheKey });
    }
  }, [queryClient]);

  return {
    performOptimisticUpdate,
    invalidateCaches,
    isUpdating
  };
}
