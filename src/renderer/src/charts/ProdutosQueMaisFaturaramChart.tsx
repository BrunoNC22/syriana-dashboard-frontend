import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'

type ProdutoFaturamentoType = {
  nome: string
  faturamento: number
}

type ChartDataType = {
  x: string
  y: number
}

export const ProdutosQueMaisFaturaramChart = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['faturamento-por-produto', startISO, endISO],
    queryFn: async (): Promise<ChartDataType[]> => {
      const remoteData = await httpClient.get<ProdutoFaturamentoType[]>({
        url: `/dashboard/faturamento-por-produto?dataInicio=${startISO}&dataFim=${endISO}`
      })
      return remoteData.map((value) => ({ x: value.nome, y: value.faturamento }))
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
      isEmpty={(d) => d.length === 0}
      emptyMessage="Não existem dados de faturamento para este período"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(data) => {
        const chartData = {
          datasets: [{ label: 'Valor vendido em R$', data, maxBarThickness: 25 }]
        }
        return (
          <div className="h-full">
            <Bar
              options={{
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
                  y: {
                    beginAtZero: true,
                    ticks: {
                      maxTicksLimit: 6,
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
