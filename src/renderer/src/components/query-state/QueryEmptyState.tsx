type Props = {
  message?: string
}

export const QueryEmptyState = ({
  message = 'Não existem dados disponíveis para este período'
}: Props): React.JSX.Element => (
  <div className="h-full flex flex-col items-center justify-center text-center pb-[30px]">
    <span className="material-symbols-outlined text-primary/30 text-5xl mb-4">folder_off</span>
    <p className="font-body-md text-on-surface-variant opacity-70 text-sm">{message}</p>
  </div>
)
