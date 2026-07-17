import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { RankingMetrica } from './RankingPage'
import { RankingOrdem } from './ranking'

type Props = {
  ordem: RankingOrdem
  onOrdemChange: (ordem: RankingOrdem) => void
  /** Métrica da rota /ranking/:metrica aberta pelo botão "Ver todos". */
  metrica: RankingMetrica
  tituloJanela: string
}

/**
 * Barra de controles dos charts de ranking: alterna Top/Bottom 10 e
 * abre o ranking completo em uma janela (/ranking/:metrica).
 */
export function RankingControls({
  ordem,
  onOrdemChange,
  metrica,
  tituloJanela
}: Props): React.JSX.Element {
  const { startISO, endISO } = useApplicationDate()

  const verTodos = (): void => {
    window.electron.openWindow(`/ranking/${metrica}?dataInicio=${startISO}&dataFim=${endISO}`, {
      width: 900,
      height: 720,
      resizable: true,
      maximizable: true,
      minimizable: true,
      title: tituloJanela,
      center: true
    })
  }

  const botao = (valor: RankingOrdem, rotulo: string, icone: string): React.JSX.Element => (
    <button
      type="button"
      onClick={() => onOrdemChange(valor)}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        ordem === valor
          ? 'bg-primary/10 text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">{icone}</span>
      {rotulo}
    </button>
  )

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-low p-0.5">
        {botao('top', 'Top 10', 'trending_up')}
        {botao('bottom', 'Bottom 10', 'trending_down')}
      </div>
      <button
        type="button"
        onClick={verTodos}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        Ver todos
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
      </button>
    </div>
  )
}
