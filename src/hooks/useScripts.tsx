
import { useState, useEffect } from 'react';
import { useFetchScripts } from './scripts/useFetchScripts';
import { useScriptOperations } from './scripts/useScriptOperations';
import { ConsentScript } from '@/types/script.types';

export type { ConsentScript };

export function useScripts() {
  const {
    scripts,
    loading: fetchLoading,
    error,
    fetchScripts,
    retryCount
  } = useFetchScripts();

  const {
    loading: operationLoading,
    addScript,
    updateScript,
    deleteScript
  } = useScriptOperations(fetchScripts);

  // Combine loading states
  const loading = fetchLoading || operationLoading;

  // Fetch scripts on mount
  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  return {
    scripts,
    loading,
    error,
    fetchScripts,
    addScript,
    updateScript,
    deleteScript,
    retryCount
  };
}
