import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { DashboardKPI } from './DashboardKPI'
import { useMemo } from 'react'

export const QuantidadeDePedidosKPI = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const { data, isError, refetch, isLoading, isRefetching } = useQuery({
    queryKey: ['quantidade-de-pedidos', startISO, endISO],
    queryFn: () =>
      httpClient.get<number>({
        url: `/dashboard/quantidade-de-pedidos?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const isEmpty = useMemo(() => {
    if (!data) return true
    return false
  }, [data])

  return (
    <DashboardKPI
      title="Quantidade Total de Pedidos"
      mainIcon="shopping_cart"
      info="+5.2% em relação ao mês anterior"
      infoIcon="trending_up"
      text={`${data}`}
      emptyMessage="Não há pedidos neste período"
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
