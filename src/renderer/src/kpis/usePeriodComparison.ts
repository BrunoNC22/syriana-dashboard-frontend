import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { getComparisonPeriod } from './periodComparison'

export type KPIComparison = {
  /** Variação percentual do período atual em relação ao anterior. */
  percent: number
  /** Rótulo do tipo de comparação (ex.: "em relação ao mês anterior"). */
  label: string
}

/**
 * Busca o valor do mesmo KPI no período anterior de referência e calcula a
 * variação percentual em relação ao valor atual.
 *
 * Retorna `null` enquanto não houver base de comparação válida (valor atual
 * ainda carregando, ou período anterior sem dados — divisão por zero).
 */
export function usePeriodComparison(
  endpoint: string,
  currentValue: number | undefined
): KPIComparison | null {
  const { range } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const comparison = useMemo(() => getComparisonPeriod(range), [range])
  const previousStartISO = format(comparison.previous.start, 'yyyy-MM-dd')
  const previousEndISO = format(comparison.previous.end, 'yyyy-MM-dd')

  const { data: previousValue } = useQuery({
    queryKey: [endpoint, 'comparacao', previousStartISO, previousEndISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `${endpoint}?dataInicio=${previousStartISO}&dataFim=${previousEndISO}`
      })
  })

  return useMemo(() => {
    if (currentValue === undefined || previousValue === undefined || previousValue === null) {
      return null
    }
    if (previousValue === 0) return null

    const percent = ((currentValue - previousValue) / previousValue) * 100
    return { percent, label: comparison.label }
  }, [currentValue, previousValue, comparison.label])
}
