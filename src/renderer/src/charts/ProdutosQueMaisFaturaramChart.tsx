import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { RankingControls } from '@renderer/features/ranking/RankingControls'
import { RankingOrdem, recortarRanking } from '@renderer/features/ranking/ranking'

type ProdutoFaturamentoType = {
  id: string
  nome: string
  faturamento: number
}

type ChartDataType = {
  id: string
  x: string
  y: number
}

export const ProdutosQueMaisFaturaramChart = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()
  const [ordem, setOrdem] = useState<RankingOrdem>('top')

  const query = useQuery({
    queryKey: ['faturamento-por-produto', startISO, endISO],
    queryFn: async (): Promise<ChartDataType[]> => {
      const remoteData = await httpClient.get<ProdutoFaturamentoType[]>({
        url: `/dashboard/faturamento-por-produto?dataInicio=${startISO}&dataFim=${endISO}`
      })
      return remoteData.map((value) => ({ id: value.id, x: value.nome, y: value.faturamento }))
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
      {(fullData) => {
        const data = recortarRanking(fullData, ordem)
        const chartData = {
          datasets: [{ label: 'Valor vendido em R$', data, maxBarThickness: 25 }]
        }
        return (
          <div className="flex h-full flex-col gap-2">
            <RankingControls
              ordem={ordem}
              onOrdemChange={setOrdem}
              metrica="produtos-faturamento"
              tituloJanela="Ranking — produtos que mais faturaram"
            />
            <div className="relative min-h-0 grow">
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
                    const actualData = data[activeElements[0].index]
                    window.electron.openWindow(
                      `/product-details/${actualData.id}?dataInicio=${startISO}&dataFim=${endISO}`,
                      {
                        width: 640,
                        height: 760,
                        resizable: true,
                        maximizable: true,
                        minimizable: true,
                        title: actualData.x,
                        center: true
                      }
                    )
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
          </div>
        )
      }}
    </QueryStateBoundary>
  )
}
