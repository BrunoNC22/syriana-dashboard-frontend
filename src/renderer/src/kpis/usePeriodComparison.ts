import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useComparison } from '@renderer/contexts/ComparisonContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { PeriodComparison, duracaoEmDias, getComparisonPeriod } from './periodComparison'

export type KPIComparison = {
  /** Variação percentual do período atual em relação ao anterior. */
  percent: number
  /** Rótulo do tipo de comparação (ex.: "em relação ao mês anterior"). */
  label: string
  /**
   * `true` quando o % foi calculado sobre a **média diária** (as durações dos
   * períodos diferem), para que a variação não engane ao comparar totais.
   */
  perDay: boolean
}

/**
 * Busca o valor do mesmo KPI no período de comparação e devolve a variação
 * percentual em relação ao valor atual.
 *
 * Retorna `undefined` enquanto não houver base de comparação válida (sem período
 * de comparação, valor atual carregando, ou período anterior sem dados).
 */
function usePreviousValue(
  endpoint: string,
  comparison: PeriodComparison | null
): number | null | undefined {
  const { httpClient } = useHttpClient()

  const startISO = comparison ? format(comparison.previous.start, 'yyyy-MM-dd') : ''
  const endISO = comparison ? format(comparison.previous.end, 'yyyy-MM-dd') : ''

  const { data } = useQuery({
    queryKey: [endpoint, 'comparacao', startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `${endpoint}?dataInicio=${startISO}&dataFim=${endISO}`
      }),
    enabled: comparison !== null
  })

  return data
}

/**
 * Calcula uma linha de comparação. Quando as durações dos períodos diferem
 * (`duracoesDiferentes`), o % é derivado da **média diária** de cada período —
 * comparar totais de janelas de tamanhos distintos distorce a variação.
 */
function buildLine(
  comparison: PeriodComparison | null,
  currentValue: number | undefined,
  previousValue: number | null | undefined,
  currentDays: number
): KPIComparison | null {
  if (!comparison) return null
  if (currentValue === undefined || previousValue === undefined || previousValue === null) {
    return null
  }

  const perDay = comparison.duracoesDiferentes
  const current = perDay ? currentValue / currentDays : currentValue
  const previous = perDay ? previousValue / duracaoEmDias(comparison.previous) : previousValue
  if (previous === 0) return null

  const percent = ((current - previous) / previous) * 100
  return { percent, label: comparison.label, perDay }
}

/**
 * Comparações de um KPI para o período atual.
 *
 * - **Linha principal**: segue o modo global selecionado (`useComparison`).
 * - **Linha anual fixa**: "vs ano anterior", acrescentada quando o modo
 *   selecionado não é já `'ano-anterior'` (evita duplicar) nem `'nenhum'`
 *   (respeita o opt-out do usuário).
 *
 * São até 2 requests adicionais por KPI (um por período de comparação),
 * cacheados pelo React Query.
 */
export function usePeriodComparison(
  endpoint: string,
  currentValue: number | undefined
): KPIComparison[] {
  const { range } = useApplicationDate()
  const { mode, customRange } = useComparison()

  const selected = useMemo(
    () => getComparisonPeriod(range, mode, customRange),
    [range, mode, customRange]
  )
  const annual = useMemo(
    () =>
      mode === 'nenhum' || mode === 'ano-anterior'
        ? null
        : getComparisonPeriod(range, 'ano-anterior'),
    [range, mode]
  )

  const selectedPrevious = usePreviousValue(endpoint, selected)
  const annualPrevious = usePreviousValue(endpoint, annual)

  const currentDays = duracaoEmDias(range)

  return useMemo(() => {
    const lines: KPIComparison[] = []
    const principal = buildLine(selected, currentValue, selectedPrevious, currentDays)
    if (principal) lines.push(principal)
    const anual = buildLine(annual, currentValue, annualPrevious, currentDays)
    if (anual) lines.push(anual)
    return lines
  }, [selected, annual, currentValue, selectedPrevious, annualPrevious, currentDays])
}
