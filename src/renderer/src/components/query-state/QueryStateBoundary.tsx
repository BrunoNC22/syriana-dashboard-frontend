import { UseQueryResult } from '@tanstack/react-query'
import { QueryBackgroundRefreshIndicator } from './QueryBackgroundRefreshIndicator'
import { QueryErrorState } from './QueryErrorState'
import { QueryEmptyState } from './QueryEmptyState'

type Props<T> = {
  query: UseQueryResult<T, Error>
  /**
   * Called with resolved data to determine if the result is "empty".
   * Return true to show the empty state instead of children.
   */
  isEmpty?: (data: T) => boolean
  emptyMessage?: string
  /**
   * Rendered while the query has no cached data (initial load).
   * Caller controls the visual — pass QueryChartLoadingState or QueryKPILoadingState.
   */
  loadingPlaceholder: React.ReactNode
  children: (data: T) => React.ReactNode
}

export function QueryStateBoundary<T>({
  query,
  isEmpty,
  emptyMessage,
  loadingPlaceholder,
  children
}: Props<T>): React.JSX.Element {
  // 1. Initial load — no cached data yet
  if (query.isPending) {
    return <>{loadingPlaceholder}</>
  }

  // 2. Error state
  if (query.isError) {
    return <QueryErrorState onRetry={() => query.refetch()} />
  }

  const data = query.data as T

  // 3. Empty state — query succeeded but data is empty
  if (isEmpty && isEmpty(data)) {
    return <QueryEmptyState message={emptyMessage} />
  }

  // 4. Success — show children, with a background-refresh indicator when re-fetching
  return (
    <div className="relative h-full">
      {query.isRefetching && (
        <QueryBackgroundRefreshIndicator className="absolute top-0 right-0 z-10" />
      )}
      {children(data)}
    </div>
  )
}
