
import { useEffect } from 'react';
import { initializeMetrics } from '@/utils/metricsUtils';

export const useMetricsInit = () => {
  useEffect(() => {
    // Initialize metrics on app start
    initializeMetrics();
  }, []);
};
