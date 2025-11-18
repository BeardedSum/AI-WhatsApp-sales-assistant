/**
 * Custom hook for dashboard statistics
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const DASHBOARD_STATS_KEY = 'dashboard-stats';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 10000, // Refetch stats every 10 seconds
    staleTime: 5000,
  });
};
