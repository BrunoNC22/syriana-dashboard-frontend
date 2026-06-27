import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import { ptBR } from 'date-fns/locale'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { ChartDataType } from '@renderer/types/ChartDataType'

type RemoteChartDataType = {
  dia: string
  faturamento: number
}

export function FaturamentoChart(): React.JSX.Element {
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['faturamento-por-dia', year, month],
    queryFn: async (): Promise<ChartDataType<Date, number>[]> => {
      const remoteData = await httpClient.get<RemoteChartDataType[]>({
        url: `/dashboard/faturamento-por-dia?ano=${year}&mes=${month}`
      })
      return remoteData.map((value) => {
        const [y, m, d] = value.dia.split('-').map(parseFloat)
        return { x: new Date(y, m - 1, d), y: value.faturamento }
      })
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
        console.log(`Valor total de faturamento do grafico ${somaDoValorTotal}`)

        if (somaDoValorTotal) return false
        else return true
      }}
      emptyMessage="Não existem dados de faturamento neste periodo"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(data) => {
        const chartData = {
          labels: [],
          datasets: [{ label: 'Faturamento em R$', data }]
        }
        return (
          <div className="h-full">
            <Line
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    type: 'time',
                    time: { tooltipFormat: "eeee, d 'de' MMMM", unit: 'day' },
                    adapters: { date: { locale: ptBR } },
                    ticks: { stepSize: 3 }
                  },
                  y: {
                    ticks: {
                      stepSize: 1500,
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
