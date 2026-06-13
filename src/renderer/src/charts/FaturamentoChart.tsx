import { Line } from 'react-chartjs-2'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ptBR } from 'date-fns/locale'
import { ChartDataType } from '@renderer/types/ChartDataType'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'

type RemoteChartDataType = {
  dia: string
  faturamento: number
}

export function FaturamentoChart(): React.JSX.Element {
  const [chartData, setChartData] = useState<ChartDataType<Date, number>[]>()
  const { month, year } = useApplicationDate()

  const { httpClient } = useHttpClient()

  const getChartData = useCallback(async (): Promise<ChartDataType<Date, number>[]> => {
    const remoteData = await httpClient.get<RemoteChartDataType[]>({
      url: `/dashboard/faturamento-por-dia?ano=${year}&mes=${month}`
    })

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
  }, [month, year, httpClient])

  const data = useMemo(
    () => ({
      labels: [],
      datasets: [
        {
          label: 'Faturamento em R$',
          data: chartData
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
