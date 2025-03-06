
import { useEffect } from 'react';
import { initializeMetrics } from '@/utils/metricsUtils';

export const useMetricsInit = () => {
  useEffect(() => {
    // Initialize metrics on app start
    // This will be called after the component mounts
    initializeMetrics();
    
    // Set up a storage event listener to reinitialize metrics if localStorage changes
    // This helps when another tab or window modifies the metrics
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'questionLibrary' || e.key === null) {
        // Re-initialize metrics if question library changes or if all localStorage is cleared
        initializeMetrics();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
};
