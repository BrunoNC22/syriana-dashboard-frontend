import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'

type RemoteProdutoVendidoType = {
  nomeProduto: string
  totalVendido: number
}

type ChartDataType = {
  x: string
  y: number
}

export const ProdutosMaisVendidosChart = (): React.JSX.Element => {
  const { month, year } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['produtos-mais-vendidos', year, month],
    queryFn: async (): Promise<ChartDataType[]> => {
      const remoteData = await httpClient.get<RemoteProdutoVendidoType[]>({
        url: `/dashboard/produtos-mais-vendidos?ano=${year}&mes=${month}`
      })
      return remoteData.map((value) => ({ x: value.nomeProduto, y: value.totalVendido }))
    }
  })

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(d) => d.length === 0}
      emptyMessage="Não existem dados de vendas para este período"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(data) => {
        const chartData = {
          datasets: [{ label: 'Quantidade de vendas', data, maxBarThickness: 25 }]
        }
        return (
          <div className="h-full">
            <Bar
              options={{
                interaction: { mode: 'point' },
                onHover: (event, chartElement) => {
                  const target = event.native?.target as HTMLCanvasElement
                  if (!target) return
                  target.style.cursor = chartElement.length ? 'pointer' : 'default'
                },
                onClick: (_, activeElements) => {
                  if (!activeElements.length) return
                  console.log(data[activeElements[0].index].x)
                },
                scales: {
                  x: {
                    ticks: {
                      callback: function (value) {
                        const label = this.getLabelForValue(value as number)
                        if (typeof label === 'string' && label.length > 10) {
                          return label.substring(0, 10) + '...'
                        }
                        return label
                      }
                    }
                  },
                  y: { ticks: { stepSize: 50 } }
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
