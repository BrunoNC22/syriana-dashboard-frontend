import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { ChartDataType } from '@renderer/types/ChartDataType'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

type RemoteData = {
  nome: string
  siglaUnidadeDeMedida: string
  quantidade: number
  precoPorUnidadeDeMedida: number
  valorTotal: number
}

export const InsumosQueMaisCustaramChart = (): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataType<string, number>[]>()
  const [remoteData, setRemoteData] = useState<RemoteData[]>()

  const { month, year } = useApplicationDate()

  const getChartData = useCallback(async () => {
    const result = await fetch(
      `${import.meta.env.VITE_API_HOST}/dashboard/insumos-que-mais-custaram?ano=${year}&mes=${month}`
    )

    const resultData: RemoteData[] = await result.json()
    const chartData = resultData.map((data) => ({ x: data.nome, y: data.valorTotal }))
    return { resultData, chartData }
  }, [month, year])

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: 'Custo total',
          data: chartData,
          maxBarThickness: 25
        }
      ]
    }),
    [chartData]
  )

  const yAxisStepSize = useMemo(() => {
    if (!chartData) return 500
    if (chartData.length === 0) return 500
    const stepSize =
      chartData.reduce((acc, curr) => {
        if (acc < curr.y) return curr.y
        return acc
      }, 0) / 5

    return stepSize
  }, [chartData])

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
    getChartData().then((data) => {
      setChartData(data.chartData)
      setRemoteData(data.resultData)
    })
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
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const item = remoteData?.[context.dataIndex]

                  if (!item) return ''

                  return [
                    `Custo total: R$ ${item.valorTotal.toFixed(2)}`,
                    `Quantidade: ${item.quantidade} ${item.siglaUnidadeDeMedida}`,
                    `Custo por ${item.siglaUnidadeDeMedida}: R$ ${item.precoPorUnidadeDeMedida.toFixed(2)}`
                  ]
                }
              }
            }
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
                stepSize: yAxisStepSize,
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
