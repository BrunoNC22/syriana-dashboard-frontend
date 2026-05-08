import { Line } from 'react-chartjs-2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { ChartDataType } from '@renderer/types/ChartDataType'

type RemoteChartDataType = {
  dia: string
  faturamento: number
}

export function FaturamentoChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<ChartDataType[]>()

  const getChartData = useCallback(async (): Promise<ChartDataType[]> => {
    const result = await fetch('http://localhost:8080/dashboard/faturamento-por-dia')
    const remoteData: RemoteChartDataType[] = await result.json()
    return remoteData.map((value) => {
      const splitedDate = value.dia.split('-')

      return {
        x: new Date(
          parseFloat(splitedDate[0]),
          parseFloat(splitedDate[1]) - 1,
          parseFloat(splitedDate[2])
        ),
        y: value.faturamento
      }
    })
  }, [])

  const data = useMemo(
    () => ({
      labels: [],
      datasets: [
        {
          label: 'Faturamento em R$',
          data: chartData,
          fill: true
          // maxBarThickness: 30
        }
      ]
    }),
    [chartData]
  )

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }),
    []
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
    getChartData().then((result) => setChartData(result))
  }, [getChartData])

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: '1',
        height: '300px'
      }}
    >
      <Line
        options={{
          ...options,
          scales: {
            x: {
              type: 'time',
              time: {
                tooltipFormat: "eeee, d 'de' MMMM",
                unit: 'day'
              },
              adapters: {
                date: {
                  locale: ptBR
                }
              },
              ticks: {
                stepSize: 3
              }
            },
            y: {
              ticks: {
                stepSize: 1500,
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
