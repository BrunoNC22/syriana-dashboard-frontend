import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { DashboardKPI } from './DashboardKPI'
import { usePeriodComparison } from './usePeriodComparison'

export const TotalVendidoKPI = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['total-vendido', startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `/dashboard/total-vendido?dataInicio=${startISO}&dataFim=${endISO}`
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

  const comparisons = usePeriodComparison('/dashboard/total-vendido', data)

  return (
    <DashboardKPI
      title="Total vendido"
      mainIcon="payments"
      comparisons={comparisons}
      text={text}
      emptyMessage="Não há vendas neste período"
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
