type DashboardChartProps = {
  title: string
  ChartElement: () => React.JSX.Element
  className?: React.HTMLAttributes<HTMLDivElement>['className']
}

export const DashboardChart = ({
  title,
  ChartElement,
  className
}: DashboardChartProps): React.JSX.Element => {
  return (
    <div
      className={
        'bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative group overflow-hidden ' +
        className
      }
    >
      <div className="flex items-center justify-between mb-stack-lg">
        <h3 className="font-h3 text-h3 text-on-surface">{title}</h3>
      </div>

      <ChartElement />
    </div>
  )
}
