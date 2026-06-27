type Props = {
  className?: string
}

export const QueryBackgroundRefreshIndicator = ({ className = '' }: Props): React.JSX.Element => (
  <span
    className={`material-symbols-outlined text-primary text-base animate-spin-gold ${className}`}
    title="Atualizando dados..."
  >
    autorenew
  </span>
)
