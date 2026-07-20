import { JSX, useMemo } from 'react'
import { useForecast } from '@renderer/features/previsao/useForecast'
import { SparklineDeArea } from './partes'
import { formatarValor } from './metricas'

const HORIZONTE = '30d'
const COR_PREVISAO = '#e5c483'

type DadosPrevisao = {
  total: number
  metodo: string
  mape: number | null
  feriado: string | null
  serie: number[]
}

function usePrevisao(): {
  dados: DadosPrevisao | null
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const { data, isError, isLoading, refetch } = useForecast('faturamento', HORIZONTE)

  const dados = useMemo(() => {
    if (!data) return null
    return {
      total: data.pontos.reduce((soma, p) => soma + p.valor, 0),
      metodo: data.metodo === 'HOLT_WINTERS' ? 'Holt-Winters' : 'Sazonal',
      mape: data.mape ?? null,
      feriado: data.feriadosNoHorizonte[0]?.nome ?? null,
      serie: data.pontos.map((p) => p.valor)
    }
  }, [data])

  return {
    dados,
    isLoading,
    isError,
    refetch: () => {
      refetch()
    }
  }
}

/**
 * Previsão de faturamento como **tira própria**, fora da faixa de KPIs.
 *
 * A separação é deliberada: a previsão não responde ao período selecionado (o
 * backend usa janela de treino própria), então deixá-la entre os KPIs quebra o
 * contrato de que tudo naquela faixa é o intervalo escolhido. O método e o erro
 * esperado ficam visíveis — previsão sem barra de erro é desinformação.
 */
export const TiraPrevisao = (): JSX.Element => {
  const { dados, isLoading, isError, refetch } = usePrevisao()

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl px-card-padding py-4 flex items-center gap-4 flex-wrap">
      <span className="material-symbols-outlined text-primary opacity-60">insights</span>

      <div className="flex-1 min-w-[200px]">
        <div className="font-label-caps text-label-caps text-on-surface-variant">
          Faturamento previsto · próximos 30 dias
        </div>
        {isLoading ? (
          <div className="mt-1 h-7 w-40 rounded shimmer-container" />
        ) : isError ? (
          <button
            onClick={refetch}
            className="mt-1 text-xs text-primary font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">refresh</span>
            Erro ao carregar — tentar novamente
          </button>
        ) : dados ? (
          <div className="mt-0.5 font-data-display text-primary font-bold text-2xl">
            {formatarValor(dados.total, 'moeda', true)}
          </div>
        ) : (
          <div className="mt-1 text-sm text-on-surface-variant opacity-70">
            Sem previsão disponível
          </div>
        )}
      </div>

      {dados && (
        <>
          <SparklineDeArea values={dados.serie} color={COR_PREVISAO} width={140} height={36} />
          <div className="text-xs text-on-surface-variant opacity-70 space-y-0.5">
            <div>{dados.metodo}</div>
            {dados.mape != null && <div>erro esperado ~{Math.round(dados.mape)}%</div>}
            {dados.feriado && <div>inclui {dados.feriado}</div>}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Mesma previsão, mas no formato de card, para as variantes que a mantêm
 * dentro da faixa de KPIs.
 */
export const CardPrevisao = (): JSX.Element => {
  const { dados, isLoading, isError, refetch } = usePrevisao()

  return (
    <div className="bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative min-h-[150px]">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
      <div className="flex justify-between items-start mb-stack-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          Previsto · 30 dias
        </span>
        <span className="material-symbols-outlined text-primary opacity-50">insights</span>
      </div>

      {isLoading ? (
        <div className="h-9 w-40 rounded-lg shimmer-container" />
      ) : isError ? (
        <button onClick={refetch} className="text-xs text-primary font-bold flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">refresh</span>
          Tentar novamente
        </button>
      ) : dados ? (
        <>
          <div className="font-data-display text-data-display text-primary font-bold leading-none">
            {formatarValor(dados.total, 'moeda', true)}
          </div>
          <div className="mt-stack-sm flex items-center justify-between gap-2">
            <SparklineDeArea values={dados.serie} color={COR_PREVISAO} width={90} height={28} />
            <span className="text-[11px] text-on-surface-variant opacity-70 text-right">
              {dados.mape != null ? `±${Math.round(dados.mape)}%` : dados.metodo}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant opacity-70">Sem previsão disponível</p>
      )}
    </div>
  )
}
