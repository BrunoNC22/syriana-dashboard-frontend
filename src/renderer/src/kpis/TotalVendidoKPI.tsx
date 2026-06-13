import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardKPI } from './DashboardKPI'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'

export const TotalVendidoKPI = (): React.JSX.Element => {
  const [totalVendido, setTotalVendido] = useState<number | null>(null)
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const getTotalVendido = useCallback(async () => {
    const responseData = await httpClient.get<number>({
      url: `/dashboard/total-vendido?ano=${year}&mes=${month}`
    })
    return responseData
  }, [year, month, httpClient])

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
