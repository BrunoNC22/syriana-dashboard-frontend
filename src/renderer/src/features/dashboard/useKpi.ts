import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { KPIComparison, usePeriodComparison } from '@renderer/kpis/usePeriodComparison'
import { DiaSerie, serieDaMetrica, useSeriesDiarias } from '@renderer/kpis/useSeriesDiarias'
import { DescritorMetrica, METRICAS, MetricaKpi, formatarValor } from './metricas'

export type DadosKpi = {
  descritor: DescritorMetrica
  valor: number | undefined
  texto: string
  /** Valor sem centavos — para layouts onde o número é grande. */
  textoCurto: string
  /**
   * Comparações do KPI. `[0]` é o modo global selecionado; `[1]`, quando existe,
   * é a comparação anual extra (só aparece se o modo selecionado não for já o
   * anual). As variantes enxutas mostram apenas `[0]` no card.
   */
  comparacoes: KPIComparison[]
  /** Série dos últimos 30 dias da métrica (janela fixa, independe do período). */
  serie: number[]
  /** Série completa com as datas — usada nos detalhes (melhor/pior dia). */
  dias: DiaSerie[]
  isLoading: boolean
  isError: boolean
  isRefetching: boolean
  isEmpty: boolean
  refetch: () => void
}

/**
 * Dados de um KPI do dashboard, prontos para desenhar.
 *
 * Existe para que as variantes de dashboard difiram **só na apresentação**:
 * todas consomem este hook, então uma diferença visual entre elas nunca é
 * consequência de terem buscado dados diferentes. O React Query deduplica as
 * requisições, então montar o mesmo KPI em duas telas não custa rede extra.
 */
export function useKpi(metrica: MetricaKpi): DadosKpi {
  const descritor = METRICAS[metrica]
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: [descritor.chaveQuery, startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `${descritor.endpoint}?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const comparacoes = usePeriodComparison(descritor.endpoint, data ?? undefined)
  const series = useSeriesDiarias()

  return useMemo(() => {
    const valor = data ?? undefined
    const carregou = valor !== undefined

    return {
      descritor,
      valor,
      texto: carregou ? formatarValor(valor, descritor.formato) : '—',
      textoCurto: carregou ? formatarValor(valor, descritor.formato, true) : '—',
      comparacoes,
      serie: serieDaMetrica(series.data, descritor.serie),
      dias: series.data ?? [],
      isLoading,
      isError,
      isRefetching,
      // Lucro pode ser legitimamente 0 ou negativo; só é "vazio" se não veio.
      isEmpty: descritor.serie === 'lucro' ? !carregou : !valor,
      refetch: () => {
        refetch()
      }
    }
  }, [data, comparacoes, series.data, isLoading, isError, isRefetching, refetch, descritor])
}
