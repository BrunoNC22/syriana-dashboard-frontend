/**
 * Shimmer placeholder for chart content areas.
 * Does NOT include a card wrapper — use inside DashboardChart.
 */
type Props = {
  height?: string
}

export const QueryChartLoadingState = ({ height = '300px' }: Props): React.JSX.Element => (
  <div className="w-full rounded-lg shimmer-container" style={{ height }} />
)

/**
 * Shimmer placeholder for KPI content areas.
 * Does NOT include the card wrapper — use inside the KPI card shell.
 */
type KPILoadingProps = {
  icon: string
}

export const QueryKPILoadingState = ({ icon }: KPILoadingProps): React.JSX.Element => (
  <>
    <div className="flex justify-between items-start mb-stack-sm">
      <div className="h-4 w-24 rounded shimmer-container" />
      <span className="material-symbols-outlined text-primary opacity-20">{icon}</span>
    </div>
    <div className="h-10 w-48 rounded-lg shimmer-container" />
  </>
)
