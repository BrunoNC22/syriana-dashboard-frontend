type DashboardKPIStateProps = {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  isRefetching: boolean
  isEmpty: boolean
  emptyMessage: string
  text: string
}

type DashboardKPIProps = {
  title: string
  text: string
  mainIcon: string
  info: string
  infoIcon: string
} & DashboardKPIStateProps

const KPIStateHandler = ({
  isLoading,
  text,
  isError,
  onRetry,
  isEmpty,
  emptyMessage
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

  return <div className="font-data-display text-data-display text-primary font-bold">{text}</div>
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
  isRefetching
}: DashboardKPIProps): React.JSX.Element => {
  return (
    <div className="bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative overflow-hidden h-[122px]">
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
      />
    </div>
  )
}
