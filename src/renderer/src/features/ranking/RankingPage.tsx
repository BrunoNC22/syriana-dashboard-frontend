import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns'
import { hoje } from '@renderer/appClock'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { DataTable, DataTableColumn } from '@renderer/components/DataTable'
import { EtiquetaChip } from '@renderer/components/EtiquetaChip'
import { EtiquetaSelect } from '@renderer/components/EtiquetaSelect'
import { useCatalogoProdutos } from '@renderer/features/busca/useCatalogoProdutos'
import { normalizar } from '@renderer/features/busca/matching'

/** Métricas suportadas pela rota /ranking/:metrica */
export type RankingMetrica = 'produtos-vendidos' | 'produtos-faturamento' | 'insumos-custo'

type ProdutoVendidoRow = { id: string; nomeProduto: string; totalVendido: number }
type ProdutoFaturamentoRow = { id: string; nome: string; faturamento: number }
type InsumoCustoRow = {
  id: string
  nome: string
  siglaUnidadeDeMedida: string | null
  quantidade: number
  precoPorUnidadeDeMedida: number
  valorTotal: number
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const qtd = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const TITULOS: Record<RankingMetrica, string> = {
  'produtos-vendidos': 'Ranking completo — produtos mais vendidos',
  'produtos-faturamento': 'Ranking completo — produtos que mais faturaram',
  'insumos-custo': 'Ranking completo — insumos que mais custaram'
}

function usePeriodo(): { dataInicio: string; dataFim: string; label: string } {
  const [searchParams] = useSearchParams()
  const dataInicio = searchParams.get('dataInicio') ?? format(startOfMonth(hoje()), 'yyyy-MM-dd')
  const dataFim = searchParams.get('dataFim') ?? format(endOfMonth(hoje()), 'yyyy-MM-dd')
  const label = `${format(parseISO(dataInicio), 'dd/MM/yyyy')} – ${format(parseISO(dataFim), 'dd/MM/yyyy')}`
  return { dataInicio, dataFim, label }
}

const abrirDetalhes = (rota: string, titulo: string): void => {
  window.electron.openWindow(rota, {
    width: 640,
    height: 760,
    resizable: true,
    maximizable: true,
    minimizable: true,
    title: titulo,
    center: true
  })
}

export function RankingPage(): React.JSX.Element {
  const { metrica } = useParams<{ metrica: RankingMetrica }>()
  const { dataInicio, dataFim, label } = usePeriodo()

  const conteudo = (() => {
    switch (metrica) {
      case 'produtos-vendidos':
        return <ProdutosVendidosRanking dataInicio={dataInicio} dataFim={dataFim} />
      case 'produtos-faturamento':
        return <ProdutosFaturamentoRanking dataInicio={dataInicio} dataFim={dataFim} />
      case 'insumos-custo':
        return <InsumosCustoRanking dataInicio={dataInicio} dataFim={dataFim} />
      default:
        return (
          <p className="text-sm text-on-surface-variant opacity-70">
            Ranking desconhecido: {metrica}
          </p>
        )
    }
  })()

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-5xl mx-auto p-container-padding flex flex-col gap-gutter">
        <header className="border-b border-outline-variant pb-stack-md">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Ranking</span>
          <h1 className="font-h2 text-h3 sm:text-h2 text-primary leading-tight mt-stack-sm">
            {metrica ? (TITULOS[metrica] ?? 'Ranking') : 'Ranking'}
          </h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1">{label}</p>
        </header>
        {conteudo}
      </div>
    </div>
  )
}

type PeriodoProps = { dataInicio: string; dataFim: string }

const RankingSkeleton = (): React.JSX.Element => (
  <div className="flex flex-col gap-stack-md">
    <div className="h-9 w-[260px] rounded-lg shimmer-container" />
    <div className="h-96 rounded-xl shimmer-container" />
  </div>
)

/**
 * Barra de busca + filtro de etiqueta + tabela — compartilhada pelas
 * três métricas. As linhas chegam completas; busca e filtro são locais.
 */
function RankingTabela<T>({
  rows,
  columns,
  rowKey,
  nomeDe,
  etiquetaDe,
  onRowClick,
  initialSortKey
}: {
  rows: T[]
  columns: DataTableColumn<T>[]
  rowKey: (r: T) => string
  nomeDe: (r: T) => string
  /** Presente = habilita o filtro por etiqueta. */
  etiquetaDe?: (r: T) => string | null
  onRowClick: (r: T) => void
  initialSortKey: string
}): React.JSX.Element {
  const [busca, setBusca] = useState('')
  const [etiqueta, setEtiqueta] = useState<string | null | undefined>(undefined)

  const etiquetas = useMemo(() => {
    if (!etiquetaDe) return []
    return [...new Set(rows.map(etiquetaDe))].sort((a, b) =>
      (a ?? '').localeCompare(b ?? '', 'pt-BR')
    )
  }, [rows, etiquetaDe])

  const filtradas = useMemo(() => {
    const termo = normalizar(busca)
    return rows.filter((row) => {
      if (termo && !normalizar(nomeDe(row)).includes(termo)) return false
      if (etiquetaDe && etiqueta !== undefined && etiquetaDe(row) !== etiqueta) return false
      return true
    })
  }, [rows, busca, etiqueta, nomeDe, etiquetaDe])

  return (
    <section className="flex flex-col gap-stack-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          className="
          flex items-center gap-2 rounded-lg border border-outline-variant
          bg-surface-container-low px-3 py-1.5 w-[260px]
          focus-within:border-primary/40 transition-colors
        "
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar por nome…"
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant placeholder:opacity-60 focus:outline-none"
          />
        </div>
        {etiquetaDe && (
          <EtiquetaSelect etiquetas={etiquetas} value={etiqueta} onChange={setEtiqueta} />
        )}
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
            search_off
          </span>
          <p className="text-sm text-on-surface-variant opacity-70">
            Nenhum item corresponde aos filtros.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtradas}
          rowKey={rowKey}
          onRowClick={onRowClick}
          initialSort={{ key: initialSortKey, dir: 'desc' }}
        />
      )}
      <p className="text-xs text-on-surface-variant opacity-60">
        {filtradas.length} de {rows.length} itens · Clique em uma linha para ver os detalhes.
      </p>
    </section>
  )
}

/** Mapa CODIGOPRODUTODETALHE → etiqueta, derivado do catálogo. */
function useEtiquetaPorDetalhe(): Map<string, string | null> {
  const catalogo = useCatalogoProdutos()
  return useMemo(
    () => new Map((catalogo.data ?? []).map((p) => [p.id, p.etiqueta])),
    [catalogo.data]
  )
}

function ProdutosVendidosRanking({ dataInicio, dataFim }: PeriodoProps): React.JSX.Element {
  const { httpClient } = useHttpClient()
  const etiquetaPorId = useEtiquetaPorDetalhe()

  const query = useQuery({
    queryKey: ['produtos-mais-vendidos', dataInicio, dataFim],
    queryFn: (): Promise<ProdutoVendidoRow[]> =>
      httpClient.get<ProdutoVendidoRow[]>({
        url: `/dashboard/produtos-mais-vendidos?dataInicio=${dataInicio}&dataFim=${dataFim}`
      })
  })

  const etiquetaDe = (r: ProdutoVendidoRow): string | null => etiquetaPorId.get(r.id) ?? null

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(d) => d.length === 0}
      emptyMessage="Não existem dados de vendas para este período."
      loadingPlaceholder={<RankingSkeleton />}
    >
      {(data) => (
        <RankingTabela
          rows={data}
          rowKey={(r) => r.id}
          nomeDe={(r) => r.nomeProduto}
          etiquetaDe={etiquetaDe}
          initialSortKey="quantidade"
          onRowClick={(r) =>
            abrirDetalhes(
              `/product-details/${r.id}?dataInicio=${dataInicio}&dataFim=${dataFim}`,
              r.nomeProduto
            )
          }
          columns={[
            {
              key: 'nome',
              header: 'Produto',
              sortValue: (r) => r.nomeProduto,
              render: (r) => r.nomeProduto
            },
            {
              key: 'etiqueta',
              header: 'Etiqueta',
              render: (r) => <EtiquetaChip etiqueta={etiquetaDe(r)} />
            },
            {
              key: 'quantidade',
              header: 'Qtd. vendida',
              align: 'right',
              sortValue: (r) => r.totalVendido,
              render: (r) => qtd(r.totalVendido)
            }
          ]}
        />
      )}
    </QueryStateBoundary>
  )
}

function ProdutosFaturamentoRanking({ dataInicio, dataFim }: PeriodoProps): React.JSX.Element {
  const { httpClient } = useHttpClient()
  const etiquetaPorId = useEtiquetaPorDetalhe()

  const query = useQuery({
    queryKey: ['faturamento-por-produto', dataInicio, dataFim],
    queryFn: (): Promise<ProdutoFaturamentoRow[]> =>
      httpClient.get<ProdutoFaturamentoRow[]>({
        url: `/dashboard/faturamento-por-produto?dataInicio=${dataInicio}&dataFim=${dataFim}`
      })
  })

  const etiquetaDe = (r: ProdutoFaturamentoRow): string | null => etiquetaPorId.get(r.id) ?? null

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(d) => d.length === 0}
      emptyMessage="Não existem dados de faturamento para este período."
      loadingPlaceholder={<RankingSkeleton />}
    >
      {(data) => (
        <RankingTabela
          rows={data}
          rowKey={(r) => r.id}
          nomeDe={(r) => r.nome}
          etiquetaDe={etiquetaDe}
          initialSortKey="faturamento"
          onRowClick={(r) =>
            abrirDetalhes(
              `/product-details/${r.id}?dataInicio=${dataInicio}&dataFim=${dataFim}`,
              r.nome
            )
          }
          columns={[
            { key: 'nome', header: 'Produto', sortValue: (r) => r.nome, render: (r) => r.nome },
            {
              key: 'etiqueta',
              header: 'Etiqueta',
              render: (r) => <EtiquetaChip etiqueta={etiquetaDe(r)} />
            },
            {
              key: 'faturamento',
              header: 'Faturamento',
              align: 'right',
              sortValue: (r) => r.faturamento,
              render: (r) => brl.format(r.faturamento)
            }
          ]}
        />
      )}
    </QueryStateBoundary>
  )
}

function InsumosCustoRanking({ dataInicio, dataFim }: PeriodoProps): React.JSX.Element {
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['insumos-que-mais-custaram', dataInicio, dataFim],
    queryFn: (): Promise<InsumoCustoRow[]> =>
      httpClient.get<InsumoCustoRow[]>({
        url: `/dashboard/insumos-que-mais-custaram?dataInicio=${dataInicio}&dataFim=${dataFim}`
      })
  })

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(d) => d.length === 0}
      emptyMessage="Não existem dados de insumos para este período."
      loadingPlaceholder={<RankingSkeleton />}
    >
      {(data) => (
        <RankingTabela
          rows={data}
          rowKey={(r) => r.id}
          nomeDe={(r) => r.nome}
          initialSortKey="custo"
          onRowClick={(r) =>
            abrirDetalhes(
              `/insumo-details/${r.id}?dataInicio=${dataInicio}&dataFim=${dataFim}`,
              r.nome
            )
          }
          columns={[
            { key: 'nome', header: 'Insumo', sortValue: (r) => r.nome, render: (r) => r.nome },
            {
              key: 'quantidade',
              header: 'Quantidade',
              align: 'right',
              sortValue: (r) => r.quantidade,
              render: (r) =>
                `${qtd(r.quantidade)}${r.siglaUnidadeDeMedida ? ` ${r.siglaUnidadeDeMedida}` : ''}`
            },
            {
              key: 'preco',
              header: 'Preço/unid.',
              align: 'right',
              sortValue: (r) => r.precoPorUnidadeDeMedida,
              render: (r) => brl.format(r.precoPorUnidadeDeMedida)
            },
            {
              key: 'custo',
              header: 'Custo total',
              align: 'right',
              sortValue: (r) => r.valorTotal,
              render: (r) => brl.format(r.valorTotal)
            }
          ]}
        />
      )}
    </QueryStateBoundary>
  )
}
