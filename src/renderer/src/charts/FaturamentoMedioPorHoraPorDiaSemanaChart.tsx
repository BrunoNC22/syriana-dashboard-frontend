import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { ChartDataType } from '@renderer/types/ChartDataType'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'

type HoraMediaFaturamentoType = {
  hora: string
  mediaFaturamento: number
}

type FaturamentoMedioPorHoraPorDiaSemanaChartProps = {
  weekDay: number
}

export const FaturamentoMedioPorHoraPorDiaSemanaChart = ({
  weekDay
}: FaturamentoMedioPorHoraPorDiaSemanaChartProps): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataType<string, number>[]>()
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const getChatData = useCallback(async (): Promise<ChartDataType<string, number>[]> => {
    const remoteData = await httpClient.get<HoraMediaFaturamentoType[]>({
      url: `/dashboard/horario-de-pico?diaSemana=${weekDay}&ano=${year}&mes=${month}`
    })
    return remoteData.map((value) => {
      return {
        x: value.hora,
        y: value.mediaFaturamento
      }
    })
  }, [month, year, weekDay, httpClient])

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

  const data = useMemo(
    () => ({
      labels: [],
      datasets: [
        {
          label: 'Faturamento médio em R$',
          data: chartData
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
    getChatData().then((value) => setChartData(value))
  }, [getChatData])
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
          scales: {
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
