import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { ChartDataType } from '@renderer/types/ChartDataType'

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
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['horario-de-pico', weekDay, year, month],
    queryFn: async (): Promise<ChartDataType<string, number>[]> => {
      const remoteData = await httpClient.get<HoraMediaFaturamentoType[]>({
        url: `/dashboard/horario-de-pico?diaSemana=${weekDay}&ano=${year}&mes=${month}`
      })
      return remoteData.map((value) => ({ x: value.hora, y: value.mediaFaturamento }))
    }
  })

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
      }),
    []
  )

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(data) => {
        if (!data) return true
        const somaDoValorTotal = data.reduce((previous, current) => previous + current.y, 0)
        if (somaDoValorTotal) return false
        else return true
      }}
      emptyMessage="Não existem dados de faturamento médio para este periodo"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(data) => {
        const yAxisStepSize =
          data.length === 0 ? 500 : data.reduce((acc, curr) => (acc < curr.y ? curr.y : acc), 0) / 5

        const chartData = {
          labels: [],
          datasets: [{ label: 'Faturamento médio em R$', data }]
        }

        return (
          <div className="h-full">
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
              data={chartData}
            />
          </div>
        )
      }}
    </QueryStateBoundary>
  )
}
