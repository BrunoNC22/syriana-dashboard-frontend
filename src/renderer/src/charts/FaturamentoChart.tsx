import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { ChartDataType } from '@renderer/types/ChartDataType'
import { colors, chartColors } from '@renderer/colors'
import { useForecast } from '@renderer/features/previsao/useForecast'

type RemoteChartDataType = {
  dia: string
  faturamento: number
}

const BANDA_MAX = 'Faixa de confiança (máx)'
const BANDA_MIN = 'Faixa de confiança (mín)'
const PREVISAO = 'Previsão'

const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function FaturamentoChart(): React.JSX.Element {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  // Um único dia selecionado: a linha não tem o que ligar (fica vazia), então
  // exibimos o ponto (pointStyle visível) para que o faturamento apareça no
  // tooltip ao passar o mouse.
  const isSingleDay = startISO === endISO

  // A previsão é uma extensão do "hoje" em diante; só faz sentido sobrepô-la
  // quando o período selecionado alcança o presente (senão a projeção futura
  // apareceria desconectada de um intervalo passado).
  const todayISO = format(new Date(), 'yyyy-MM-dd')
  const showForecast = endISO >= todayISO

  const query = useQuery({
    queryKey: ['faturamento-por-dia', startISO, endISO],
    queryFn: async (): Promise<ChartDataType<Date, number>[]> => {
      const remoteData = await httpClient.get<RemoteChartDataType[]>({
        url: `/dashboard/faturamento-por-dia?dataInicio=${startISO}&dataFim=${endISO}`
      })
      return remoteData.map((value) => {
        const [y, m, d] = value.dia.split('-').map(parseFloat)
        return { x: new Date(y, m - 1, d), y: value.faturamento }
      })
    }
  })

  const forecastQuery = useForecast('faturamento', '30d', showForecast)

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

  const tooltipFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
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
        return !somaDoValorTotal
      }}
      emptyMessage="Não existem dados de faturamento neste periodo"
      loadingPlaceholder={<QueryChartLoadingState height="300px" />}
    >
      {(data) => {
        const forecast = showForecast ? forecastQuery.data : undefined

        // Constrói as séries de previsão. Preserva o mapa data→nome do feriado
        // para o tooltip; vazio quando não há previsão a exibir.
        const feriadoNomePorTempo = new Map<number, string>()

        const forecastDatasets =
          forecast && forecast.pontos.length > 0
            ? (() => {
                const linha = forecast.pontos.map((p) => ({ x: parseISODate(p.data), y: p.valor }))
                const superior = forecast.pontos.map((p) => ({
                  x: parseISODate(p.data),
                  y: p.limiteSuperior
                }))
                const inferior = forecast.pontos.map((p) => ({
                  x: parseISODate(p.data),
                  y: p.limiteInferior
                }))
                const feriadoFlags = forecast.pontos.map((p) => p.feriado)

                forecast.feriadosNoHorizonte.forEach((f) =>
                  feriadoNomePorTempo.set(parseISODate(f.data).getTime(), f.nome)
                )

                // Conecta a projeção ao último ponto real (linha tracejada parte
                // dele; a banda de confiança começa com largura zero nesse ponto).
                const ultimo = data[data.length - 1]
                if (ultimo) {
                  linha.unshift({ x: ultimo.x, y: ultimo.y })
                  superior.unshift({ x: ultimo.x, y: ultimo.y })
                  inferior.unshift({ x: ultimo.x, y: ultimo.y })
                  feriadoFlags.unshift(false)
                }

                return [
                  {
                    label: BANDA_MAX,
                    data: superior,
                    borderColor: 'transparent',
                    backgroundColor: `${colors.primary}22`,
                    pointRadius: 0,
                    fill: '+1',
                    tension: 0.3
                  },
                  {
                    label: BANDA_MIN,
                    data: inferior,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    fill: false,
                    tension: 0.3
                  },
                  {
                    label: PREVISAO,
                    data: linha,
                    borderColor: colors.primaryLight,
                    borderDash: [6, 4],
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.3,
                    pointStyle: 'rectRot',
                    pointBackgroundColor: chartColors.warning,
                    pointBorderColor: colors.primaryLight,
                    pointRadius: (ctx: { dataIndex: number }) =>
                      feriadoFlags[ctx.dataIndex] ? 5 : 0,
                    pointHoverRadius: (ctx: { dataIndex: number }) =>
                      feriadoFlags[ctx.dataIndex] ? 7 : 3
                  }
                ]
              })()
            : []

        const chartData = {
          labels: [],
          datasets: [
            {
              label: 'Faturamento em R$',
              data,
              // Com um único dia a linha fica vazia (só 1 ponto); tornamos o ponto
              // visível e dourado para que o faturamento apareça no tooltip ao passar o mouse.
              ...(isSingleDay
                ? {
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: colors.primaryLight,
                    pointBorderWidth: 2
                  }
                : {})
            },
            ...forecastDatasets
          ]
        }
        return (
          <div className="h-full">
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    // Esconde as linhas das bandas de confiança do tooltip (ruído).
                    filter: (item) =>
                      item.dataset.label !== BANDA_MAX && item.dataset.label !== BANDA_MIN,
                    callbacks: {
                      label: (context) => {
                        const valor = tooltipFormatter.format(context.parsed.y ?? 0)
                        if (context.dataset.label === PREVISAO) {
                          const nome = feriadoNomePorTempo.get(context.parsed.x as number)
                          return `Previsão: ${valor}${nome ? ` · ${nome}` : ''}`
                        }
                        return valor
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    type: 'time',
                    time: { tooltipFormat: "eeee, d 'de' MMMM", unit: 'day' },
                    adapters: { date: { locale: ptBR } },
                    ticks: { source: 'auto', autoSkip: true, maxTicksLimit: 8 }
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
