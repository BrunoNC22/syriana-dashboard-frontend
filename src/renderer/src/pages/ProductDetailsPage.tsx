import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { QueryKPILoadingState } from '@renderer/components/query-state/QueryLoadingState'

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

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function KPICard({
  label,
  value,
  sub
}: {
  label: string
  value: string
  sub?: string
}): React.JSX.Element {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-[#737373] uppercase tracking-wide">{label}</span>
      <span className="text-xl font-bold text-[#F5F5F5]">{value}</span>
      {sub && <span className="text-xs text-[#737373]">{sub}</span>}
    </div>
  )
}

export function ProductDetailsPage(): React.JSX.Element {
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()

  const ano = searchParams.get('ano') ?? String(new Date().getFullYear())
  const mes = searchParams.get('mes')

  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['produto-detalhes', productId, ano, mes],
    queryFn: (): Promise<ProdutoDetalhes> =>
      httpClient.get<ProdutoDetalhes>({
        url: `/dashboard/produto-detalhes?id=${productId}&ano=${ano}${mes ? `&mes=${mes}` : ''}`
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
    if (mes) return `${MONTH_NAMES[Number(mes) - 1]} ${ano}`
    return `Ano ${ano}`
  }, [ano, mes])

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F5F5] p-6 flex flex-col gap-6">
      <QueryStateBoundary
        query={query}
        isEmpty={(d) => !d || !d.nomeProduto}
        emptyMessage="Produto sem dados para o período selecionado."
        loadingPlaceholder={
          <div className="flex flex-col gap-4">
            <QueryKPILoadingState />
            <QueryKPILoadingState />
          </div>
        }
      >
        {(data) => (
          <>
            {/* Header */}
            <div className="border-b border-[#2A2A2A] pb-4">
              <h1 className="text-xl font-bold text-[#C8A96A] leading-tight">{data.nomeProduto}</h1>
              <p className="text-sm text-[#737373] mt-1">{periodLabel}</p>
            </div>

            {/* KPI row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                label="Unidades vendidas"
                value={data.quantidadeVendida.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              />
              <KPICard label="Faturamento" value={brl.format(data.faturamento)} />
            </div>

            {/* KPI row 2 */}
            <div className="grid grid-cols-3 gap-3">
              <KPICard
                label="Custo de insumos"
                value={brl.format(data.custoTotal)}
                sub={
                  data.faturamento > 0
                    ? `${((data.custoTotal / data.faturamento) * 100).toFixed(1)}% do fat.`
                    : undefined
                }
              />
              <KPICard
                label="Lucro"
                value={brl.format(data.lucro)}
                sub={data.lucro >= 0 ? 'positivo' : 'prejuízo'}
              />
              <KPICard
                label="Margem"
                value={`${data.margemLucro.toFixed(1)}%`}
                sub={
                  data.margemLucro >= 50 ? 'alta' : data.margemLucro >= 20 ? 'moderada' : 'baixa'
                }
              />
            </div>

            {/* Ingredient table */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-[#C8A96A] uppercase tracking-wide">
                Insumos utilizados
              </h2>

              {data.insumos.length === 0 ? (
                <p className="text-sm text-[#737373] italic">
                  Nenhum movimento de estoque registrado para este produto no período.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-[#2A2A2A]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
                        <th className="text-left px-4 py-2 text-[#737373] font-medium">Insumo</th>
                        <th className="text-right px-4 py-2 text-[#737373] font-medium">
                          Qtd total
                        </th>
                        <th className="text-right px-4 py-2 text-[#737373] font-medium">
                          Custo total
                        </th>
                        <th className="text-right px-4 py-2 text-[#737373] font-medium">
                          % do custo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.insumos.map((insumo, i) => (
                        <tr
                          key={i}
                          className="border-b border-[#1E1E1E] hover:bg-[#161616] transition-colors"
                        >
                          <td className="px-4 py-2 text-[#F5F5F5]">{insumo.nome}</td>
                          <td className="px-4 py-2 text-right text-[#BFBFBF]">
                            {insumo.quantidadeTotal.toLocaleString('pt-BR', {
                              maximumFractionDigits: 3
                            })}{' '}
                            <span className="text-[#737373]">{insumo.siglaUnidadeDeMedida}</span>
                          </td>
                          <td className="px-4 py-2 text-right text-[#BFBFBF]">
                            {brl.format(insumo.custoTotal)}
                          </td>
                          <td className="px-4 py-2 text-right text-[#737373]">
                            {data.custoTotal > 0
                              ? `${((insumo.custoTotal / data.custoTotal) * 100).toFixed(1)}%`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#2A2A2A] bg-[#1A1A1A]">
                        <td className="px-4 py-2 text-[#737373] font-medium">Total</td>
                        <td className="px-4 py-2" />
                        <td className="px-4 py-2 text-right font-semibold text-[#C8A96A]">
                          {brl.format(data.custoTotal)}
                        </td>
                        <td className="px-4 py-2 text-right text-[#737373]">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </QueryStateBoundary>
    </div>
  )
}
