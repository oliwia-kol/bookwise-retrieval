import { useQuery } from '@tanstack/react-query';
import { searchAPI, fetchHealth } from '@/lib/api';
import type { SearchFilters } from '@/lib/types';

export function useSearch(query: string, filters: SearchFilters) {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => searchAPI(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30000, // 30 seconds
    staleTime: 1000 * 30,
  });
}
