import { useMemo } from 'react'
import { DashboardKPI } from './DashboardKPI'
import { useForecast } from '@renderer/features/previsao/useForecast'

const HORIZONTE = '30d'

/**
 * KPI de faturamento previsto para os próximos 30 dias.
 *
 * Consome `/analytics/previsao` (independente do período do dashboard — o
 * backend usa janela de treino própria) e soma os pontos previstos. O MAPE do
 * backtest é exibido no subtítulo: previsão sem barra de erro é desinformação.
 */
export const FaturamentoPrevistoKPI = (): React.JSX.Element => {
  const { data, isError, isLoading, isRefetching, refetch } = useForecast('faturamento', HORIZONTE)

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'standard',
        maximumFractionDigits: 2
      }),
    []
  )

  const total = useMemo(
    () => (data ? data.pontos.reduce((soma, p) => soma + p.valor, 0) : undefined),
    [data]
  )

  const isEmpty = total === undefined || total === 0

  const text = total === undefined ? 'Carregando...' : formatter.format(total)

  const subtitle = useMemo(() => {
    if (!data) return undefined
    const metodo = data.metodo === 'HOLT_WINTERS' ? 'Holt-Winters' : 'Sazonal'
    const erro = data.mape != null ? ` · erro esperado ~${Math.round(data.mape)}%` : ''
    const feriado =
      data.feriadosNoHorizonte.length > 0 ? ` · inclui ${data.feriadosNoHorizonte[0].nome}` : ''
    return `${metodo}${erro}${feriado}`
  }, [data])

  return (
    <DashboardKPI
      title="Faturamento previsto · 30 dias"
      mainIcon="insights"
      subtitle={subtitle}
      text={text}
      emptyMessage="Sem previsão disponível"
      isEmpty={isEmpty}
      isError={isError}
      onRetry={() => {
        refetch()
      }}
      isLoading={isLoading}
      isRefetching={isRefetching}
    />
  )
}
