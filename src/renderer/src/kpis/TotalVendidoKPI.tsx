import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { DashboardKPI } from './DashboardKPI'

export const TotalVendidoKPI = (): React.JSX.Element => {
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['total-vendido', year, month],
    queryFn: () =>
      httpClient.get<number>({ url: `/dashboard/total-vendido?ano=${year}&mes=${month}` })
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

  return (
    <DashboardKPI
      title="Total vendido"
      mainIcon="payments"
      info="+12.5% em relação ao mês anterior"
      infoIcon="trending_up"
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
