import { useCallback, useEffect, useState } from 'react'
import { DashboardKPI } from './DashboardKPI'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'

export const QuantidadeDePedidosKPI = (): React.JSX.Element => {
  const [quantidadeDePedidos, setQuantidadeDePedidos] = useState<number | null>(null)
  const { month, year } = useApplicationDate()

  const getQuantidadeDePedidos = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_HOST}/dashboard/quantidade-de-pedidos?ano=${year}&mes=${month}`
    )

    const responseData: number = await response.json()
    return responseData
  }, [year, month])

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
