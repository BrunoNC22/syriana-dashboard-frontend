import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import { ptBR } from 'date-fns/locale'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryChartLoadingState } from '@renderer/components/query-state/QueryLoadingState'
import { ChartDataType } from '@renderer/types/ChartDataType'
import { colors, chartColors } from '@renderer/colors'
import { useForecast } from '@renderer/features/previsao/useForecast'
import { hojeISO } from '@renderer/appClock'

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
  const todayISO = hojeISO()
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
        const hojeTime = parseISODate(todayISO).getTime()

        // O backend pré-preenche com zero TODOS os dias do intervalo, inclusive
        // os que ainda não aconteceram. Sem este corte a linha real despenca a
        // zero no dia seguinte a hoje e segue no chão até o fim do mês/ano —
        // num ano selecionado são 249 dias de linha zerada achatando a escala.
        const historico = data.filter((p) => p.x.getTime() <= hojeTime)
        const pontosPrevisao = forecast?.pontos ?? []

        // Eixo de datas comum aos dois datasets. `interaction.mode = 'index'`
        // (ChartJSConfig) agrupa o tooltip por POSIÇÃO no array, não por data:
        // com séries de tamanhos diferentes o título vinha de um dia e o corpo
        // de outro (ex.: título "7 de abril" com a previsão de 1º de maio).
        // Alinhadas na mesma grade, cada índice corresponde a um único dia.
        const eixo = [
          ...new Set([
            ...historico.map((p) => p.x.getTime()),
            ...pontosPrevisao.map((p) => parseISODate(p.data).getTime())
          ])
        ].sort((a, b) => a - b)

        const realPorTempo = new Map(historico.map((p) => [p.x.getTime(), p.y]))
        const previsaoPorTempo = new Map(
          pontosPrevisao.map((p) => [parseISODate(p.data).getTime(), p])
        )

        // Mapa data→nome do feriado para o tooltip; vazio sem previsão a exibir.
        const feriadoNomePorTempo = new Map<number, string>()
        forecast?.feriadosNoHorizonte.forEach((f) =>
          feriadoNomePorTempo.set(parseISODate(f.data).getTime(), f.nome)
        )

        const serieReal = eixo.map((t) => ({ x: new Date(t), y: realPorTempo.get(t) ?? null }))

        // O eixo cobre o período selecionado inteiro, não só os dias com dados:
        // escolhendo o ano corrente, a escala vai até 31/12 mesmo com a linha
        // parando em hoje. O teto se estende quando a previsão passa do fim do
        // período (mês selecionado + horizonte de 30 dias), senão ela sairia
        // cortada.
        const inicioDoEixo = parseISODate(startISO).getTime()
        const fimDoEixo = Math.max(parseISODate(endISO).getTime(), eixo[eixo.length - 1] ?? 0)

        // Um dia só no passado (sem previsão) daria min === max, escala sem
        // extensão: folga de meio dia para os dois lados centra o ponto.
        const MEIA_JANELA_MS = 12 * 60 * 60 * 1000
        const semExtensao = inicioDoEixo === fimDoEixo
        const xMin = semExtensao ? inicioDoEixo - MEIA_JANELA_MS : inicioDoEixo
        const xMax = semExtensao ? fimDoEixo + MEIA_JANELA_MS : fimDoEixo

        // A previsão começa em "hoje", dia que o histórico também cobre. Nesse
        // ponto de junção vale o valor real, com a banda de largura zero, para
        // a linha tracejada partir de onde a linha cheia termina.
        const ancora = historico[historico.length - 1]
        const ancoraTime = ancora?.x.getTime()

        const previsto = (
          t: number,
          campo: 'valor' | 'limiteInferior' | 'limiteSuperior'
        ): number | null => {
          const ponto = previsaoPorTempo.get(t)
          if (!ponto) return null
          return ancora && t === ancoraTime ? ancora.y : ponto[campo]
        }

        const serieDePrevisao = (
          campo: 'valor' | 'limiteInferior' | 'limiteSuperior'
        ): { x: Date; y: number | null }[] =>
          eixo.map((t) => ({ x: new Date(t), y: previsto(t, campo) }))

        const feriadoFlags = eixo.map((t) => previsaoPorTempo.get(t)?.feriado ?? false)

        const forecastDatasets =
          pontosPrevisao.length > 0
            ? [
                {
                  label: BANDA_MAX,
                  data: serieDePrevisao('limiteSuperior'),
                  borderColor: 'transparent',
                  backgroundColor: `${colors.primary}22`,
                  pointRadius: 0,
                  fill: '+1',
                  tension: 0.3
                },
                {
                  label: BANDA_MIN,
                  data: serieDePrevisao('limiteInferior'),
                  borderColor: 'transparent',
                  backgroundColor: 'transparent',
                  pointRadius: 0,
                  fill: false,
                  tension: 0.3
                },
                {
                  label: PREVISAO,
                  data: serieDePrevisao('valor'),
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
            : []

        const chartData = {
          labels: [],
          datasets: [
            {
              label: 'Faturamento em R$',
              data: serieReal,
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
                    // Esconde as bandas de confiança (ruído) e as séries que não
                    // existem naquele dia — na grade comum elas entram como null.
                    filter: (item) =>
                      item.dataset.label !== BANDA_MAX &&
                      item.dataset.label !== BANDA_MIN &&
                      item.parsed.y !== null &&
                      item.parsed.y !== undefined,
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
                    min: xMin,
                    max: xMax,
                    time: { tooltipFormat: "eeee, d 'de' MMMM" },
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
