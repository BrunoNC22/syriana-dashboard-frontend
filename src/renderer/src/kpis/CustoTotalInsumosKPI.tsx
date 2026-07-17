import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { DashboardKPI } from './DashboardKPI'
import { usePeriodComparison } from './usePeriodComparison'

export const CustoTotalInsumosKPI = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['total-gasto-ingredientes', startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `/dashboard/total-gasto-ingredientes?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const isEmpty = useMemo(() => {
    return !data
  }, [data])

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

  const text = useMemo(() => {
    if (!data) return 'Carregando...'

    return formatter.format(data)
  }, [data, formatter])

  const comparisons = usePeriodComparison('/dashboard/total-gasto-ingredientes', data)

  return (
    <DashboardKPI
      title="Custo total dos insumos"
      mainIcon="inventory_2"
      comparisons={comparisons}
      higherIsBetter={false}
      text={text}
      emptyMessage="Não há custo de insumos neste período"
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
