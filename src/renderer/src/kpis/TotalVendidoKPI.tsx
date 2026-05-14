import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardKPI } from './DashboardKPI'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'

export const TotalVendidoKPI = (): React.JSX.Element => {
  const [totalVendido, setTotalVendido] = useState<number | null>(null)
  const { month, year } = useApplicationDate()

  const getTotalVendido = useCallback(async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_HOST}/dashboard/total-vendido?ano=${year}&mes=${month}`
    )

    const responseData: number = await response.json()
    return responseData
  }, [year, month])

  const formatter = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'standard',
      maximumFractionDigits: 2
    })
    return formatter
  }, [])

  useEffect(() => {
    getTotalVendido().then((value) => setTotalVendido(value))
  }, [getTotalVendido])
  return (
    <DashboardKPI
      title="TOTAL VENDIDO"
      text={`${totalVendido ? formatter.format(totalVendido) : '...'}`}
      mainIcon="payments"
      info="+12.5% em relação ao mês anterior"
      infoIcon="trending_up"
    />
  )
}
