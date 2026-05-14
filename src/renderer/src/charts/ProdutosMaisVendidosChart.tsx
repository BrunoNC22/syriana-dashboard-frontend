import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

type RemoteProdutoVendidoType = {
  nomeProduto: string
  totalVendido: number
}

type ChartDataType = {
  x: string
  y: number
}

export const ProdutosMaisVendidosChart = (): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataType[]>()
  const { month, year } = useApplicationDate()

  const getChartData = useCallback(async (): Promise<ChartDataType[]> => {
    const result = await fetch(
      `${import.meta.env.VITE_API_HOST}/dashboard/produtos-mais-vendidos?ano=${year}&mes=${month}`
    )
    const remoteData: RemoteProdutoVendidoType[] = await result.json()
    return remoteData.map((value) => ({ x: value.nomeProduto, y: value.totalVendido }))
  }, [month, year])

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: 'Quantidade de vendas',
          data: chartData,
          maxBarThickness: 25
        }
      ]
    }),
    [chartData]
  )

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
          interaction: {
            mode: 'point'
          },
          onHover: (event, chartElement) => {
            const target = event.native?.target as HTMLCanvasElement
            if (!target) return
            target.style.cursor = chartElement.length ? 'pointer' : 'default'
          },
          onClick: (_, activeElements) => {
            if (!activeElements.length || !chartData) return
            console.log(chartData[activeElements[0].index].x)
          },
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
                stepSize: 50
              }
            }
          }
        }}
        data={data}
      />
    </div>
  )
}
