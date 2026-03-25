import { useCallback } from 'react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';

export function usePageRefresh(pageKey: string) {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: [pageKey] });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [pageKey] });
  }, [queryClient, pageKey]);

  const getLastUpdated = useCallback((): number | null => {
    const queries = queryClient.getQueriesData({ queryKey: [pageKey] });
    if (queries.length === 0) return null;

    let latest = 0;
    for (const [queryKey] of queries) {
      const state = queryClient.getQueryState(queryKey);
      if (state?.dataUpdatedAt && state.dataUpdatedAt > latest) {
        latest = state.dataUpdatedAt;
      }
    }
    return latest || null;
  }, [queryClient, pageKey]);

  return {
    refresh,
    isRefreshing: isFetching > 0,
    getLastUpdated,
  };
}
