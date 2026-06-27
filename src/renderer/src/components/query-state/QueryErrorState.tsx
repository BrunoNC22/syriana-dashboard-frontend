type Props = {
  onRetry: () => void
}

export const QueryErrorState = ({ onRetry }: Props): React.JSX.Element => (
  <div className="h-full flex flex-col items-center justify-center text-center min-h-[140px] pb-[30px]">
    <span className="material-symbols-outlined text-error text-4xl mb-3">error_outline</span>
    <p className="font-body-md text-on-surface-variant mb-4 text-sm">
      Não foi possível carregar os dados
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary text-sm font-bold rounded hover:bg-primary/10 transition-colors flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-sm">refresh</span>
      Tentar novamente
    </button>
  </div>
)
