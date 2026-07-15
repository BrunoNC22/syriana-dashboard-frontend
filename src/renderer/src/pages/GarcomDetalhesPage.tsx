import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { EtiquetaChip } from '@renderer/components/EtiquetaChip'
import { EtiquetaSelect } from '@renderer/components/EtiquetaSelect'

type ProdutoRanking = {
  nomeProduto: string
  etiqueta: string | null
  quantidade: number
}

type GarcomDetalhes = {
  id: number
  nome: string | null
  totalTaxaServico: number
  faturamento: number
  custo: number
  lucro: number
  comandas: number
  itensLancados: number
  produtosMaisVendidos: ProdutoRanking[]
}

type MetricCardProps = {
  label: string
  value: string
  icon: string
  sub?: string
  valueClassName?: string
}

const MetricCard = ({
  label,
  value,
  icon,
  sub,
  valueClassName = 'text-primary'
}: MetricCardProps): React.JSX.Element => (
  <div className="bg-surface-container p-stack-md rounded-xl border border-outline-variant shadow-md relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
    <div className="flex justify-between items-start mb-stack-sm gap-2">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <span className="material-symbols-outlined text-primary opacity-50 text-lg">{icon}</span>
    </div>
    <div
      className={`font-data-display text-xl leading-tight font-bold break-words ${valueClassName}`}
    >
      {value}
    </div>
    {sub && <span className="text-xs text-on-surface-variant opacity-70 mt-1 block">{sub}</span>}
  </div>
)

const LoadingSkeleton = (): React.JSX.Element => (
  <div className="flex flex-col gap-gutter">
    <div className="h-8 w-2/3 rounded-lg shimmer-container" />
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-stack-md">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl shimmer-container" />
      ))}
    </div>
    <div className="h-64 rounded-xl shimmer-container" />
  </div>
)

export function GarcomDetalhesPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const dataInicio =
    searchParams.get('dataInicio') ?? format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const dataFim = searchParams.get('dataFim') ?? format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const { httpClient } = useHttpClient()

  const [filtroEtiqueta, setFiltroEtiqueta] = useState<string | null | undefined>(undefined)

  const query = useQuery({
    queryKey: ['garcom-detalhes', id, dataInicio, dataFim],
    queryFn: (): Promise<GarcomDetalhes> =>
      httpClient.get<GarcomDetalhes>({
        url: `/garcons/${id}?dataInicio=${dataInicio}&dataFim=${dataFim}`
      })
  })

  const brl = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    []
  )

  const periodLabel = useMemo(() => {
    const inicio = parseISO(dataInicio)
    const fim = parseISO(dataFim)
    if (isSameDay(inicio, fim)) {
      return format(inicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    }
    return `${format(inicio, 'dd/MM/yyyy')} – ${format(fim, 'dd/MM/yyyy')}`
  }, [dataInicio, dataFim])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-5xl mx-auto p-container-padding flex flex-col gap-gutter">
        <QueryStateBoundary
          query={query}
          isEmpty={(d) => !d || !d.nome}
          emptyMessage="Este garçom não possui pedidos no período selecionado."
          loadingPlaceholder={<LoadingSkeleton />}
        >
          {(data) => {
            const lucroPositivo = data.lucro >= 0
            const margem = data.faturamento > 0 ? (data.lucro / data.faturamento) * 100 : 0

            return (
              <>
                {/* Header */}
                <header className="border-b border-outline-variant pb-stack-md">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Desempenho do garçom
                  </span>
                  <h1 className="font-h2 text-h3 sm:text-h2 text-primary leading-tight mt-stack-sm">
                    {data.nome}
                  </h1>
                  <p className="text-sm text-on-surface-variant opacity-70 mt-1">{periodLabel}</p>
                </header>

                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-stack-md">
                  <MetricCard
                    label="A receber (10%)"
                    icon="payments"
                    value={brl.format(data.totalTaxaServico)}
                    sub="Soma da taxa de serviço"
                  />
                  <MetricCard
                    label="Faturamento"
                    icon="receipt_long"
                    value={brl.format(data.faturamento)}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Lucro"
                    icon={lucroPositivo ? 'trending_up' : 'trending_down'}
                    value={brl.format(data.lucro)}
                    sub={`${margem.toFixed(1)}% de margem`}
                    valueClassName={lucroPositivo ? 'text-primary' : 'text-error'}
                  />
                  <MetricCard
                    label="Comandas"
                    icon="table_restaurant"
                    value={data.comandas.toLocaleString('pt-BR')}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Itens lançados"
                    icon="list_alt"
                    value={data.itensLancados.toLocaleString('pt-BR')}
                    valueClassName="text-on-surface"
                  />
                </div>

                {/* Produtos mais vendidos */}
                {(() => {
                  const etiquetasDistintas = data.produtosMaisVendidos.reduce<(string | null)[]>(
                    (acc, p) => {
                      if (!acc.some((e) => e === p.etiqueta)) acc.push(p.etiqueta)
                      return acc
                    },
                    []
                  )

                  const filtrados =
                    filtroEtiqueta === undefined
                      ? data.produtosMaisVendidos
                      : data.produtosMaisVendidos.filter((p) => p.etiqueta === filtroEtiqueta)

                  return (
                    <section className="flex flex-col gap-stack-md">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                          Mais vendidos por este garçom
                        </h2>
                        {data.produtosMaisVendidos.length > 0 && (
                          <EtiquetaSelect
                            etiquetas={etiquetasDistintas}
                            value={filtroEtiqueta}
                            onChange={setFiltroEtiqueta}
                          />
                        )}
                      </div>

                      {data.produtosMaisVendidos.length === 0 ? (
                        <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
                          <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
                            restaurant_menu
                          </span>
                          <p className="text-sm text-on-surface-variant opacity-70">
                            Nenhum item lançado por este garçom no período.
                          </p>
                        </div>
                      ) : filtrados.length === 0 ? (
                        <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
                          <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
                            filter_alt_off
                          </span>
                          <p className="text-sm text-on-surface-variant opacity-70">
                            Nenhum item nesta etiqueta.
                          </p>
                          <button
                            onClick={() => setFiltroEtiqueta(undefined)}
                            className="px-2 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-bold rounded hover:bg-primary/10 transition-colors"
                          >
                            Limpar filtro
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-md">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-surface-container-high text-on-surface-variant">
                                <th className="text-left px-stack-md py-stack-sm font-label-caps text-label-caps">
                                  #
                                </th>
                                <th className="text-left px-stack-md py-stack-sm font-label-caps text-label-caps">
                                  Produto
                                </th>
                                <th className="text-left px-stack-md py-stack-sm font-label-caps text-label-caps">
                                  Etiqueta
                                </th>
                                <th className="text-right px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap">
                                  Qtd. vendida
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtrados.map((p, i) => (
                                <tr
                                  key={i}
                                  className="bg-surface-container border-t border-outline-variant hover:bg-surface-container-high transition-colors"
                                >
                                  <td className="px-stack-md py-stack-sm text-on-surface-variant opacity-70">
                                    {i + 1}
                                  </td>
                                  <td className="px-stack-md py-stack-sm text-on-surface">
                                    {p.nomeProduto}
                                  </td>
                                  <td className="px-stack-md py-stack-sm">
                                    <EtiquetaChip etiqueta={p.etiqueta} />
                                  </td>
                                  <td className="px-stack-md py-stack-sm text-right text-on-surface-variant whitespace-nowrap">
                                    {p.quantidade.toLocaleString('pt-BR', {
                                      maximumFractionDigits: 0
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  )
                })()}
              </>
            )
          }}
        </QueryStateBoundary>
      </div>
    </div>
  )
}
