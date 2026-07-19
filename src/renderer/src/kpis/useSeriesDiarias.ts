import { useMemo } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'

export type DiaSerie = {
  dia: string
  faturamento: number
  pedidos: number
  custo: number
  lucro: number
}

export type MetricaSerie = 'faturamento' | 'pedidos' | 'custo' | 'lucro'

/**
 * Série diária das últimas ~30 dias com todas as métricas num único registro
 * por dia. A janela é **fixa** (trailing 30 dias até hoje), independente do
 * período selecionado no dashboard: a sparkline comunica a "tendência recente"
 * do negócio, não o intervalo do KPI. Como todos os cards chamam este hook com
 * a mesma janela, o React Query deduplica em uma única requisição compartilhada.
 */
export function useSeriesDiarias(): UseQueryResult<DiaSerie[]> {
  const { httpClient } = useHttpClient()

  const { startISO, endISO } = useMemo(() => {
    const end = new Date()
    const start = subDays(end, 29)
    return {
      startISO: format(start, 'yyyy-MM-dd'),
      endISO: format(end, 'yyyy-MM-dd')
    }
  }, [])

  return useQuery({
    queryKey: ['series-diarias', startISO, endISO],
    queryFn: () =>
      httpClient.get<DiaSerie[]>({
        url: `/dashboard/series-diarias?dataInicio=${startISO}&dataFim=${endISO}`
      }),
    staleTime: 10 * 60 * 1000
  })
}

/** Extrai o vetor de uma métrica da série (vazio enquanto não carregou). */
export function serieDaMetrica(dias: DiaSerie[] | undefined, metrica: MetricaSerie): number[] {
  return dias ? dias.map((d) => d[metrica]) : []
}
