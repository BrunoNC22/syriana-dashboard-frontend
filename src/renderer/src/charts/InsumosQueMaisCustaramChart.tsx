import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { RankingControls } from '@renderer/features/ranking/RankingControls'
import { RankingOrdem, recortarRanking } from '@renderer/features/ranking/ranking'

type RemoteData = {
  id: string
  nome: string
  siglaUnidadeDeMedida: string
  quantidade: number
  precoPorUnidadeDeMedida: number
  valorTotal: number
}

type ChartPoint = {
  x: string
  y: number
}

export const InsumosQueMaisCustaramChart = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()
  const [ordem, setOrdem] = useState<RankingOrdem>('top')

  const query = useQuery({
    queryKey: ['insumos-que-mais-custaram', startISO, endISO],
    queryFn: () =>
      httpClient.get<RemoteData[]>({
        url: `/dashboard/insumos-que-mais-custaram?dataInicio=${startISO}&dataFim=${endISO}`
      })
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
        const somaDoValorTotal = data.reduce(
          (previous, current) => previous + current.valorTotal,
          0
        )

        if (somaDoValorTotal) return false
        else return true
      }}
      emptyMessage="Não existem dados de consumo de ingredientes para este período"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(fullData) => {
        const remoteData = recortarRanking(fullData, ordem)
        const chartPoints: ChartPoint[] = remoteData.map((d) => ({ x: d.nome, y: d.valorTotal }))

        const yAxisStepSize =
          chartPoints.length === 0
            ? 500
            : chartPoints.reduce((acc, curr) => (acc < curr.y ? curr.y : acc), 0) / 5

        const chartData = {
          datasets: [{ label: 'Custo total', data: chartPoints, maxBarThickness: 25 }]
        }

        return (
          <div className="flex h-full flex-col gap-2">
            <RankingControls
              ordem={ordem}
              onOrdemChange={setOrdem}
              metrica="insumos-custo"
              tituloJanela="Ranking — insumos que mais custaram"
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
                    const actualData = remoteData[activeElements[0].index]
                    window.electron.openWindow(
                      `/insumo-details/${actualData.id}?dataInicio=${startISO}&dataFim=${endISO}`,
                      {
                        width: 640,
                        height: 760,
                        resizable: true,
                        maximizable: true,
                        minimizable: true,
                        title: actualData.nome,
                        center: true
                      }
                    )
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const item = remoteData[context.dataIndex]
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
                          if (typeof label === 'string' && label.length > 10) {
                            return label.substring(0, 10) + '...'
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
                data={chartData}
              />
            </div>
          </div>
        )
      }}
    </QueryStateBoundary>
  )
}
