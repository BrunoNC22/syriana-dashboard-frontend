import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { DashboardKPI } from './DashboardKPI'
import { usePeriodComparison } from './usePeriodComparison'

export const LucroTotalKPI = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['lucro-total', startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `/dashboard/lucro-total?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const isEmpty = useMemo(() => {
    return data === undefined || data === null
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
    if (data === undefined || data === null) return 'Carregando...'

    return formatter.format(data)
  }, [data, formatter])

  const comparison = usePeriodComparison('/dashboard/lucro-total', data)

  return (
    <DashboardKPI
      title="Lucro total"
      mainIcon="trending_up"
      comparison={comparison}
      text={text}
      emptyMessage="Não há lucro neste período"
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
