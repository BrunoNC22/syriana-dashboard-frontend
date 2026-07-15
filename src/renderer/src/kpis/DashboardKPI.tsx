import { KPIComparison } from './usePeriodComparison'

type DashboardKPIStateProps = {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isRefetching: boolean
  isEmpty: boolean
  emptyMessage: string
  text: string
  comparison?: KPIComparison | null
}

type DashboardKPIProps = {
  title: string
  text: string
  mainIcon: string
} & DashboardKPIStateProps

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero'
})

/** Linha de variação percentual: verde quando sobe, vermelho quando cai. */
const KPIComparisonLine = ({ comparison }: { comparison: KPIComparison }): React.JSX.Element => {
  const isPositive = comparison.percent >= 0
  const color = isPositive ? 'text-[#4CAF50]' : 'text-[#F44336]'
  const icon = isPositive ? 'trending_up' : 'trending_down'

  return (
    <div className={`mt-stack-sm flex items-center gap-1 ${color}`}>
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      <span className="font-body-md text-xs">
        {percentFormatter.format(comparison.percent)}% {comparison.label}
      </span>
    </div>
  )
}

const KPIStateHandler = ({
  isLoading,
  text,
  isError,
  onRetry,
  isEmpty,
  emptyMessage,
  comparison
}: DashboardKPIStateProps): React.JSX.Element => {
  if (isLoading) return <div className="h-10 w-48 rounded-lg shimmer-container" />

  if (isError)
    return (
      <div className="flex flex-col items-center justify-items-center gap-2">
        <div className="flex gap-1">
          <span className="material-symbols-outlined text-error text-xs">error_outline</span>
          <p className="font-body-md text-on-surface-variant text-xs">Erro ao carregar dados</p>
        </div>
        <button
          onClick={onRetry}
          className="px-2 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-bold rounded hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xs">refresh</span>
          Tentar novamente
        </button>
      </div>
    )

  if (isEmpty)
    return <p className="font-body-md text-on-surface-variant opacity-70 text-sm">{emptyMessage}</p>

  return (
    <div>
      <div className="font-data-display text-data-display text-primary font-bold">{text}</div>
      {comparison && <KPIComparisonLine comparison={comparison} />}
    </div>
  )
}

/**
 * Conteúdo interno de um card KPI.
 * O card wrapper (bg, border, shadow) é responsabilidade do componente pai.
 */
export const DashboardKPI = ({
  title,
  text,
  mainIcon,
  isLoading,
  emptyMessage,
  isEmpty,
  isError,
  onRetry,
  isRefetching,
  comparison
}: DashboardKPIProps): React.JSX.Element => {
  return (
    <div className="bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative overflow-hidden h-[140px]">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <div className="flex justify-between items-start mb-stack-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant">{title}</span>
        <span className="material-symbols-outlined text-primary opacity-50">{mainIcon}</span>
      </div>
      <KPIStateHandler
        text={text}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        isEmpty={isEmpty}
        isError={isError}
        onRetry={onRetry}
        isRefetching={isRefetching}
        comparison={comparison}
      />
    </div>
  )
}
