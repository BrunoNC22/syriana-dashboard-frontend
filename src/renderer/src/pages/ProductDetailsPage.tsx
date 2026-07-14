import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, isSameDay, parseISO, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'

type InsumoDoProduto = {
  nome: string
  siglaUnidadeDeMedida: string
  quantidadeTotal: number
  custoTotal: number
}

type ProdutoDetalhes = {
  nomeProduto: string
  quantidadeVendida: number
  faturamento: number
  custoTotal: number
  lucro: number
  margemLucro: number
  insumos: InsumoDoProduto[]
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
    <div className={`font-data-display text-xl leading-tight font-bold break-words ${valueClassName}`}>
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

export function ProductDetailsPage(): React.JSX.Element {
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()

  const dataInicio =
    searchParams.get('dataInicio') ?? format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const dataFim = searchParams.get('dataFim') ?? format(endOfMonth(new Date()), 'yyyy-MM-dd')

  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['produto-detalhes', productId, dataInicio, dataFim],
    queryFn: (): Promise<ProdutoDetalhes> =>
      httpClient.get<ProdutoDetalhes>({
        url: `/dashboard/produto-detalhes?id=${productId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
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
          isEmpty={(d) => !d || !d.nomeProduto}
          emptyMessage="Este produto não possui vendas no período selecionado."
          loadingPlaceholder={<LoadingSkeleton />}
        >
          {(data) => {
            const lucroPositivo = data.lucro >= 0
            const custoPercentual =
              data.faturamento > 0 ? (data.custoTotal / data.faturamento) * 100 : 0

            return (
              <>
                {/* Header */}
                <header className="border-b border-outline-variant pb-stack-md">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Detalhes do produto
                  </span>
                  <h1 className="font-h2 text-h3 sm:text-h2 text-primary leading-tight mt-stack-sm">
                    {data.nomeProduto}
                  </h1>
                  <p className="text-sm text-on-surface-variant opacity-70 mt-1">{periodLabel}</p>
                </header>

                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-stack-md">
                  <MetricCard
                    label="Unidades vendidas"
                    icon="shopping_cart"
                    value={data.quantidadeVendida.toLocaleString('pt-BR', {
                      maximumFractionDigits: 0
                    })}
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Faturamento"
                    icon="payments"
                    value={brl.format(data.faturamento)}
                  />
                  <MetricCard
                    label="Custo de insumos"
                    icon="restaurant"
                    value={brl.format(data.custoTotal)}
                    sub={
                      data.faturamento > 0 ? `${custoPercentual.toFixed(1)}% do faturamento` : undefined
                    }
                    valueClassName="text-on-surface"
                  />
                  <MetricCard
                    label="Lucro"
                    icon={lucroPositivo ? 'trending_up' : 'trending_down'}
                    value={brl.format(data.lucro)}
                    sub={lucroPositivo ? 'Resultado positivo' : 'Prejuízo no período'}
                    valueClassName={lucroPositivo ? 'text-primary' : 'text-error'}
                  />
                  <MetricCard
                    label="Margem"
                    icon="percent"
                    value={`${data.margemLucro.toFixed(1)}%`}
                    sub={
                      data.margemLucro >= 50
                        ? 'Margem alta'
                        : data.margemLucro >= 20
                          ? 'Margem moderada'
                          : 'Margem baixa'
                    }
                    valueClassName={lucroPositivo ? 'text-primary' : 'text-error'}
                  />
                </div>

                {/* Ingredient breakdown */}
                <section className="flex flex-col gap-stack-md">
                  <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                    Insumos utilizados
                  </h2>

                  {data.insumos.length === 0 ? (
                    <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
                      <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
                        inventory_2
                      </span>
                      <p className="text-sm text-on-surface-variant opacity-70">
                        Nenhum movimento de estoque registrado para este produto no período.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-md">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-surface-container-high text-on-surface-variant">
                            <th className="text-left px-stack-md py-stack-sm font-label-caps text-label-caps">
                              Insumo
                            </th>
                            <th className="text-right px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap">
                              Qtd. total
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
                          {data.insumos.map((insumo, i) => (
                            <tr
                              key={i}
                              className="bg-surface-container border-t border-outline-variant hover:bg-surface-container-high transition-colors"
                            >
                              <td className="px-stack-md py-stack-sm text-on-surface">{insumo.nome}</td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant whitespace-nowrap">
                                {insumo.quantidadeTotal.toLocaleString('pt-BR', {
                                  maximumFractionDigits: 3
                                })}{' '}
                                <span className="opacity-60">{insumo.siglaUnidadeDeMedida}</span>
                              </td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant whitespace-nowrap">
                                {brl.format(insumo.custoTotal)}
                              </td>
                              <td className="px-stack-md py-stack-sm text-right text-on-surface-variant opacity-70 whitespace-nowrap">
                                {data.custoTotal > 0
                                  ? `${((insumo.custoTotal / data.custoTotal) * 100).toFixed(1)}%`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-surface-container-high border-t border-outline-variant">
                            <td className="px-stack-md py-stack-sm font-label-caps text-label-caps text-on-surface-variant">
                              Total
                            </td>
                            <td className="px-stack-md py-stack-sm" />
                            <td className="px-stack-md py-stack-sm text-right font-bold text-primary whitespace-nowrap">
                              {brl.format(data.custoTotal)}
                            </td>
                            <td className="px-stack-md py-stack-sm text-right text-on-surface-variant opacity-70">
                              100%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
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
