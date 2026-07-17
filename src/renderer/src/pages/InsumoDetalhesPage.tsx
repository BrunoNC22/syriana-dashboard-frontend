import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'

type ProdutoQueUsaInsumo = {
  id: string
  nomeProduto: string
  quantidadeUsada: number
  custoTotal: number
}

type InsumoDetalhes = {
  nome: string
  siglaUnidadeDeMedida: string | null
  quantidadeTotal: number
  custoTotal: number
  custoMedioPorUnidade: number
  produtosDistintos: number
  movimentacoes: number
  produtos: ProdutoQueUsaInsumo[]
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

export function InsumoDetalhesPage(): React.JSX.Element {
  const { insumoId } = useParams<{ insumoId: string }>()
  const [searchParams] = useSearchParams()

  const dataInicio =
    searchParams.get('dataInicio') ?? format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const dataFim = searchParams.get('dataFim') ?? format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['insumo-detalhes', insumoId, dataInicio, dataFim],
    queryFn: (): Promise<InsumoDetalhes> =>
      httpClient.get<InsumoDetalhes>({
        url: `/dashboard/insumo-detalhes?id=${insumoId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
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

  const abrirProduto = (produto: ProdutoQueUsaInsumo): void => {
    window.electron.openWindow(
      `/product-details/${produto.id}?dataInicio=${dataInicio}&dataFim=${dataFim}`,
      {
        width: 640,
        height: 760,
        resizable: true,
        maximizable: true,
        minimizable: true,
        title: produto.nomeProduto,
        center: true
      }
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-5xl mx-auto p-container-padding flex flex-col gap-gutter">
        <QueryStateBoundary
          query={query}
          isEmpty={(d) => !d || !d.nome}
          emptyMessage="Este insumo não possui consumo no período selecionado."
          loadingPlaceholder={<LoadingSkeleton />}
        >
          {(data) => {
            const sigla = data.siglaUnidadeDeMedida ?? ''

            return (
              <>
                {/* Header */}
                <header className="border-b border-outline-variant pb-stack-md">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Detalhes do insumo
                  </span>
                  <h1 className="font-h2 text-h3 sm:text-h2 text-primary leading-tight mt-stack-sm">
                    {data.nome}
                  </h1>
                  <p className="text-sm text-on-surface-variant opacity-70 mt-1">{periodLabel}</p>
                </header>

                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-stack-md">
                  <MetricCard
                    label="Custo total"
                    icon="payments"
                    value={brl.format(data.custoTotal)}
                    sub="Consumo no período"
                  />
                  <MetricCard
                    label="Quantidade consumida"
                    icon="scale"
                    value={`${data.quantidadeTotal.toLocaleString('pt-BR', {
                      maximumFractionDigits: 3
                    })}${sigla ? ` ${sigla}` : ''}`}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Custo médio"
                    icon="sell"
                    value={brl.format(data.custoMedioPorUnidade)}
                    sub={sigla ? `por ${sigla}` : undefined}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Produtos que usam"
                    icon="lunch_dining"
                    value={data.produtosDistintos.toLocaleString('pt-BR')}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Movimentações"
                    icon="sync_alt"
                    value={data.movimentacoes.toLocaleString('pt-BR')}
                    sub="Saídas de estoque"
                    valueClassName="text-on-surface"
                  />
                </div>

                {/* Produtos que mais usaram o insumo */}
                <section className="flex flex-col gap-stack-md">
                  <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                    Produtos que mais utilizaram este insumo
                  </h2>

                  {data.produtos.length === 0 ? (
                    <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
                      <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
                        inventory_2
                      </span>
                      <p className="text-sm text-on-surface-variant opacity-70">
                        Nenhum produto vendido consumiu este insumo no período.
                      </p>
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
                            <th className="text-right px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap">
                              Qtd. utilizada
                            </th>
                            <th className="text-right px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap">
                              Custo total
                            </th>
                            <th className="text-right px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap">
                              % do custo
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.produtos.map((produto, i) => (
                            <tr
                              key={produto.id}
                              onClick={() => abrirProduto(produto)}
                              className="bg-surface-container border-t border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                            >
                              <td className="px-stack-md py-stack-sm text-on-surface-variant opacity-70">
                                {i + 1}
                              </td>
                              <td className="px-stack-md py-stack-sm text-on-surface">
                                {produto.nomeProduto}
                              </td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant whitespace-nowrap">
                                {produto.quantidadeUsada.toLocaleString('pt-BR', {
                                  maximumFractionDigits: 3
                                })}
                                {sigla && <span className="opacity-60"> {sigla}</span>}
                              </td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant whitespace-nowrap">
                                {brl.format(produto.custoTotal)}
                              </td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant opacity-70 whitespace-nowrap">
                                {data.custoTotal > 0
                                  ? `${((produto.custoTotal / data.custoTotal) * 100).toFixed(1)}%`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-surface-container-high border-t-2 border-outline">
                            <td className="px-stack-md py-stack-sm" />
                            <td className="px-stack-md py-stack-sm font-label-caps text-label-caps text-on-surface-variant">
                              Total do período (todos os produtos)
                            </td>
                            <td className="px-stack-md py-stack-sm text-right font-data-display font-bold text-on-surface whitespace-nowrap">
                              {data.quantidadeTotal.toLocaleString('pt-BR', {
                                maximumFractionDigits: 3
                              })}
                              {sigla && <span className="opacity-60 font-normal"> {sigla}</span>}
                            </td>
                            <td className="px-stack-md py-stack-sm text-right font-data-display font-bold text-primary whitespace-nowrap">
                              {brl.format(data.custoTotal)}
                            </td>
                            <td className="px-stack-md py-stack-sm text-right text-on-surface-variant opacity-70 whitespace-nowrap">
                              100%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                  {data.produtos.length > 0 && (
                    <p className="text-xs text-on-surface-variant opacity-60">
                      Clique em um produto para ver seus detalhes.
                    </p>
                  )}
                </section>
              </>
            )
          }}
        </QueryStateBoundary>
      </div>
    </div>
  )
}
