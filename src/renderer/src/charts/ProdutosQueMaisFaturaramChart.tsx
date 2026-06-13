import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

type ProdutoFaturamentoType = {
  nome: string
  faturamento: number
}

type ChartDataType = {
  x: string
  y: number
}

export const ProdutosQueMaisFaturaramChart = (): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataType[]>()
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const getChartData = useCallback(async (): Promise<ChartDataType[]> => {
    const remoteData = await httpClient.get<ProdutoFaturamentoType[]>({
      url: `/dashboard/faturamento-por-produto?ano=${year}&mes=${month}`
    })
    return remoteData.map((value) => ({ x: value.nome, y: value.faturamento }))
  }, [year, month, httpClient])

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: 'Valor vendido em R$',
          data: chartData,
          maxBarThickness: 25
        }
      ]
    }),
    [chartData]
  )

  const formatter = useMemo(() => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      compactDisplay: 'short', // Usa 'mil' e 'mi'
      maximumFractionDigits: 2
    })

    return formatter
  }, [])

  useEffect(() => {
    getChartData().then((value) => setChartData(value))
  }, [getChartData])

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: '1',
        height: '300px'
      }}
    >
      <Bar
        options={{
          scales: {
            x: {
              ticks: {
                callback: function (value) {
                  const label = this.getLabelForValue(value as number)
                  const limite = 10 // ajuste conforme sua necessidade

                  if (typeof label === 'string' && label.length > limite) {
                    return label.substring(0, limite) + '...'
                  }
                  return label
                }
              }
            },
            y: {
              ticks: {
                stepSize: 2000,
                callback: (value) => formatter.format(value as number)
              }
            }
          }
        }}
        data={data}
      />
    </div>
  )
}
