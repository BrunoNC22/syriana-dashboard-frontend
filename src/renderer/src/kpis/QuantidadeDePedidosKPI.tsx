import { useCallback, useEffect, useState } from 'react'
import { DashboardKPI } from './DashboardKPI'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'

export const QuantidadeDePedidosKPI = (): React.JSX.Element => {
  const [quantidadeDePedidos, setQuantidadeDePedidos] = useState<number | null>(null)
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const getQuantidadeDePedidos = useCallback(async () => {
    const responseData = await httpClient.get<number>({
      url: `/dashboard/quantidade-de-pedidos?ano=${year}&mes=${month}`
    })
    return responseData
  }, [year, month, httpClient])

  useEffect(() => {
    getQuantidadeDePedidos().then((value) => setQuantidadeDePedidos(value))
  }, [getQuantidadeDePedidos])
  return (
    <DashboardKPI
      title="Quantidade Total de Pedidos"
      text={`${quantidadeDePedidos}`}
      mainIcon="shopping_cart"
      info="+5.2% em relação ao mês anterior"
      infoIcon="trending_up"
    />
  )
}
