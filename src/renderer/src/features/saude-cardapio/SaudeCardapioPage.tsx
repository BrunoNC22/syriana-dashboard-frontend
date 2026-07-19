import { JSX, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { DataTable, DataTableColumn } from '@renderer/components/DataTable'
import { EtiquetaChip } from '@renderer/components/EtiquetaChip'
import DateRangePicker from '@renderer/components/DateRangePicker'

/** Formato dos DTOs de /analytics/produtos-baixo-desempenho (F3-01). */
type ProdutoSemVenda = {
  id: string
  nome: string
  etiqueta: string | null
  ultimaVenda: string | null
  novo: boolean
}
type ProdutoQueda = {
  id: string
  nome: string
  etiqueta: string | null
  quantidadeAtual: number
  quantidadeAnterior: number
  variacaoPercentual: number
}
type ProdutoTendenciaQueda = {
  id: string
  nome: string
  etiqueta: string | null
  slopePorSemana: number
  quantidadeTotal: number
  semanas: number
}
type ProdutoAbandonado = {
  id: string
  nome: string
  etiqueta: string | null
  ultimaVenda: string | null
  mesesComVenda: number
  quantidadeUltimos6Meses: number
}
type ProdutosBaixoDesempenho = {
  semVendas: ProdutoSemVenda[]
  maioresQuedas: ProdutoQueda[]
  tendenciaQueda: ProdutoTendenciaQueda[]
  abandonados: ProdutoAbandonado[]
}

/** Formato dos DTOs de /analytics/insumos-baixo-uso (F3-02). */
type InsumoPoucoUtilizado = {
  id: string
  nome: string
  sigla: string
  quantidadeConsumida: number
  custoConsumido: number
  ultimoUso: string | null
  novo: boolean
}
type InsumoCapitalParado = {
  id: string
  nome: string
  sigla: string
  estoqueAtual: number
  custoEstoqueParado: number
  ultimoUso: string | null
}
type InsumoQuedaConsumo = {
  id: string
  nome: string
  sigla: string
  quantidadeAtual: number
  quantidadeAnterior: number
  variacaoPercentual: number
}
type InsumoForaDoPadrao = {
  id: string
  nome: string
  sigla: string
  consumoUltimaSemana: number
  mediaSemanal: number
  desvioPadrao: number
  zScore: number
}
type InsumosBaixoUso = {
  poucoUtilizados: InsumoPoucoUtilizado[]
  capitalParado: InsumoCapitalParado[]
  quedaConsumo: InsumoQuedaConsumo[]
  foraDoPadrao: InsumoForaDoPadrao[]
}

const qtd = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
const brl = (n: number): string => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (n: number): string =>
  `${n > 0 ? '+' : ''}${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
const dataBr = (iso: string | null): string =>
  iso ? format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR }) : 'nunca'
/** Quantidade com a sigla da unidade de medida ao lado. */
const qtdComSigla = (n: number, sigla: string): string => `${qtd(n)} ${sigla}`.trim()

type Aba = 'produtos' | 'insumos'

export const SaudeCardapioPage = (): JSX.Element => {
  const [aba, setAba] = useState<Aba>('produtos')

  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <Link
            to="/"
            className="text-xs text-on-surface-variant opacity-70 hover:opacity-100 hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </Link>
          <h1 className="font-h1 text-primary text-h2 sm:text-h1 mt-1">Saúde do cardápio</h1>
        </div>
        <DateRangePicker />
      </div>

      <AbaTabs aba={aba} onChange={setAba} />

      {aba === 'produtos' ? <PainelProdutos /> : <PainelInsumos />}

      <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
        <div>© 2026 Restaurante Syriana. All rights reserved.</div>
        <div>Análise de baixo desempenho do cardápio</div>
      </footer>
    </section>
  )
}

/** Seletor de abas Produtos / Insumos (segmented control). */
const AbaTabs = ({ aba, onChange }: { aba: Aba; onChange: (a: Aba) => void }): JSX.Element => {
  const item = (valor: Aba, icone: string, rotulo: string): JSX.Element => {
    const ativo = aba === valor
    return (
      <button
        type="button"
        onClick={() => onChange(valor)}
        className={`px-4 py-1.5 text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
          ativo
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'text-on-surface-variant opacity-70 hover:opacity-100 border border-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-base">{icone}</span>
        {rotulo}
      </button>
    )
  }
  return (
    <div className="inline-flex gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
      {item('produtos', 'restaurant_menu', 'Produtos')}
      {item('insumos', 'inventory_2', 'Insumos')}
    </div>
  )
}

// ─────────────────────────────────────────── Painel de Produtos

const PainelProdutos = (): JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['produtos-baixo-desempenho', startISO, endISO],
    queryFn: (): Promise<ProdutosBaixoDesempenho> =>
      httpClient.get<ProdutosBaixoDesempenho>({
        url: `/analytics/produtos-baixo-desempenho?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const abrirProduto = (r: { id: string; nome: string }): void => {
    window.electron.openWindow(
      `/product-details/${r.id}?dataInicio=${startISO}&dataFim=${endISO}`,
      {
        width: 640,
        height: 760,
        resizable: true,
        maximizable: true,
        minimizable: true,
        title: r.nome,
        center: true
      }
    )
  }

  return (
    <div className="space-y-gutter">
      <p className="text-sm text-on-surface-variant opacity-70 max-w-3xl">
        Produtos do cardápio ativo com baixo desempenho no período selecionado. Só considera itens à
        venda (descontinuados e pausados ficam de fora). Clique numa linha para ver os detalhes.
      </p>

      <QueryStateBoundary
        query={query}
        isEmpty={(d) =>
          d.semVendas.length === 0 &&
          d.maioresQuedas.length === 0 &&
          d.tendenciaQueda.length === 0 &&
          d.abandonados.length === 0
        }
        emptyMessage="Nenhum produto de baixo desempenho neste período — cardápio saudável."
        loadingPlaceholder={<SaudeSkeleton />}
      >
        {(data) => (
          <div className="space-y-stack-lg">
            <SecaoSemVendas produtos={data.semVendas} onRowClick={abrirProduto} />
            <SecaoMaioresQuedas produtos={data.maioresQuedas} onRowClick={abrirProduto} />
            <SecaoTendenciaQueda produtos={data.tendenciaQueda} onRowClick={abrirProduto} />
            <SecaoAbandonados produtos={data.abandonados} onRowClick={abrirProduto} />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  )
}

// ─────────────────────────────────────────── Painel de Insumos

const PainelInsumos = (): JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['insumos-baixo-uso', startISO, endISO],
    queryFn: (): Promise<InsumosBaixoUso> =>
      httpClient.get<InsumosBaixoUso>({
        url: `/analytics/insumos-baixo-uso?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const abrirInsumo = (r: { id: string; nome: string }): void => {
    window.electron.openWindow(`/insumo-details/${r.id}?dataInicio=${startISO}&dataFim=${endISO}`, {
      width: 640,
      height: 760,
      resizable: true,
      maximizable: true,
      minimizable: true,
      title: r.nome,
      center: true
    })
  }

  return (
    <div className="space-y-gutter">
      <p className="text-sm text-on-surface-variant opacity-70 max-w-3xl">
        Insumos com baixo uso ou comportamento fora do padrão no período. “Capital parado” cruza
        estoque atual com ausência de consumo — o insight mais acionável. Clique numa linha para ver
        os detalhes do insumo.
      </p>

      <QueryStateBoundary
        query={query}
        isEmpty={(d) =>
          d.poucoUtilizados.length === 0 &&
          d.capitalParado.length === 0 &&
          d.quedaConsumo.length === 0 &&
          d.foraDoPadrao.length === 0
        }
        emptyMessage="Nenhum insumo de baixo uso neste período — estoque girando bem."
        loadingPlaceholder={<SaudeSkeleton />}
      >
        {(data) => (
          <div className="space-y-stack-lg">
            <SecaoCapitalParado insumos={data.capitalParado} onRowClick={abrirInsumo} />
            <SecaoPoucoUtilizados insumos={data.poucoUtilizados} onRowClick={abrirInsumo} />
            <SecaoQuedaConsumo insumos={data.quedaConsumo} onRowClick={abrirInsumo} />
            <SecaoForaDoPadrao insumos={data.foraDoPadrao} onRowClick={abrirInsumo} />
          </div>
        )}
      </QueryStateBoundary>
    </div>
  )
}

// ─────────────────────────────────────────── Compartilhados

const SaudeSkeleton = (): JSX.Element => (
  <div className="space-y-stack-lg">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="space-y-stack-sm">
        <div className="h-6 w-64 rounded-lg shimmer-container" />
        <div className="h-56 rounded-xl shimmer-container" />
      </div>
    ))}
  </div>
)

/** Cabeçalho + corpo de uma seção; mostra estado vazio próprio quando a lista some. */
function Secao<T>({
  titulo,
  icone,
  descricao,
  itens,
  vazioMensagem,
  columns,
  rowKey,
  onRowClick,
  initialSort,
  destaque
}: {
  titulo: string
  icone: string
  descricao: string
  itens: T[]
  vazioMensagem: string
  columns: DataTableColumn<T>[]
  rowKey: (r: T) => string
  onRowClick: (r: T) => void
  initialSort: { key: string; dir: 'asc' | 'desc' }
  destaque?: boolean
}): JSX.Element {
  return (
    <div className="space-y-stack-md">
      <div className="flex items-baseline gap-2">
        <span
          className={`material-symbols-outlined text-lg ${destaque ? 'text-error' : 'text-primary opacity-70'}`}
        >
          {icone}
        </span>
        <h2 className="font-h2 text-h3 text-on-surface">{titulo}</h2>
        <span className="text-xs text-on-surface-variant opacity-60">
          {itens.length.toLocaleString('pt-BR')}
        </span>
      </div>
      <p className="text-sm text-on-surface-variant opacity-70 -mt-1">{descricao}</p>
      {itens.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
            check_circle
          </span>
          <p className="text-sm text-on-surface-variant opacity-70">{vazioMensagem}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={itens}
          rowKey={rowKey}
          onRowClick={onRowClick}
          initialSort={initialSort}
        />
      )}
    </div>
  )
}

/** Nome + chip opcional "novo" (produto ou insumo lançado há < 30 dias). */
const CelulaNome = ({ nome, novo }: { nome: string; novo?: boolean }): JSX.Element => (
  <span className="inline-flex items-center gap-2">
    {nome}
    {novo && (
      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/15 text-primary border border-primary/30">
        novo
      </span>
    )}
  </span>
)

/** Barra vermelha proporcional à magnitude da queda (%), ao lado do valor. */
const BarraQueda = ({ valor }: { valor: number }): JSX.Element => {
  const largura = Math.min(Math.abs(valor), 100)
  return (
    <span className="inline-flex items-center gap-2 justify-end w-full">
      <span className="text-error whitespace-nowrap">{pct(valor)}</span>
      <span className="h-1.5 w-16 rounded-full bg-error/15 overflow-hidden shrink-0">
        <span className="block h-full rounded-full bg-error" style={{ width: `${largura}%` }} />
      </span>
    </span>
  )
}

// ─────────────────────────────────────────── Seções de Produtos

function SecaoSemVendas({
  produtos,
  onRowClick
}: {
  produtos: ProdutoSemVenda[]
  onRowClick: (r: ProdutoSemVenda) => void
}): JSX.Element {
  const columns: DataTableColumn<ProdutoSemVenda>[] = useMemo(
    () => [
      {
        key: 'nome',
        header: 'Produto',
        sortValue: (r) => r.nome,
        render: (r) => <CelulaNome nome={r.nome} novo={r.novo} />
      },
      {
        key: 'etiqueta',
        header: 'Etiqueta',
        render: (r) => <EtiquetaChip etiqueta={r.etiqueta} />
      },
      {
        key: 'ultimaVenda',
        header: 'Última venda',
        align: 'right',
        sortValue: (r) => r.ultimaVenda ?? '',
        render: (r) => dataBr(r.ultimaVenda)
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Sem vendas no período"
      icone="production_quantity_limits"
      descricao="Produtos ativos que não venderam nenhuma unidade no intervalo. O selo “novo” marca itens lançados há menos de 30 dias."
      itens={produtos}
      vazioMensagem="Todos os produtos ativos venderam ao menos uma vez neste período."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'ultimaVenda', dir: 'asc' }}
    />
  )
}

function SecaoMaioresQuedas({
  produtos,
  onRowClick
}: {
  produtos: ProdutoQueda[]
  onRowClick: (r: ProdutoQueda) => void
}): JSX.Element {
  const columns: DataTableColumn<ProdutoQueda>[] = useMemo(
    () => [
      { key: 'nome', header: 'Produto', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'etiqueta',
        header: 'Etiqueta',
        render: (r) => <EtiquetaChip etiqueta={r.etiqueta} />
      },
      {
        key: 'anterior',
        header: 'Qtd. anterior',
        align: 'right',
        sortValue: (r) => r.quantidadeAnterior,
        render: (r) => qtd(r.quantidadeAnterior)
      },
      {
        key: 'atual',
        header: 'Qtd. atual',
        align: 'right',
        sortValue: (r) => r.quantidadeAtual,
        render: (r) => qtd(r.quantidadeAtual)
      },
      {
        key: 'variacao',
        header: 'Variação',
        align: 'right',
        sortValue: (r) => r.variacaoPercentual,
        render: (r) => <BarraQueda valor={r.variacaoPercentual} />
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Maiores quedas nas vendas"
      icone="trending_down"
      descricao="Produtos que mais caíram em quantidade vendida frente ao período anterior de mesma duração."
      itens={produtos}
      vazioMensagem="Nenhum produto caiu significativamente frente ao período anterior."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'variacao', dir: 'asc' }}
    />
  )
}

function SecaoTendenciaQueda({
  produtos,
  onRowClick
}: {
  produtos: ProdutoTendenciaQueda[]
  onRowClick: (r: ProdutoTendenciaQueda) => void
}): JSX.Element {
  const columns: DataTableColumn<ProdutoTendenciaQueda>[] = useMemo(
    () => [
      { key: 'nome', header: 'Produto', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'etiqueta',
        header: 'Etiqueta',
        render: (r) => <EtiquetaChip etiqueta={r.etiqueta} />
      },
      {
        key: 'total',
        header: 'Qtd. no período',
        align: 'right',
        sortValue: (r) => r.quantidadeTotal,
        render: (r) => qtd(r.quantidadeTotal)
      },
      {
        key: 'semanas',
        header: 'Semanas',
        align: 'right',
        sortValue: (r) => r.semanas,
        render: (r) => r.semanas.toLocaleString('pt-BR')
      },
      {
        key: 'slope',
        header: 'Tendência/semana',
        align: 'right',
        sortValue: (r) => r.slopePorSemana,
        render: (r) => (
          <span className="inline-flex items-center gap-1 text-error justify-end w-full">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            {qtd(r.slopePorSemana)}/sem
          </span>
        )
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Em tendência de queda"
      icone="show_chart"
      descricao="Produtos cuja venda semanal vem caindo de forma consistente no período (inclinação negativa da reta de tendência)."
      itens={produtos}
      vazioMensagem="Nenhum produto em tendência consistente de queda no período."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'slope', dir: 'asc' }}
    />
  )
}

function SecaoAbandonados({
  produtos,
  onRowClick
}: {
  produtos: ProdutoAbandonado[]
  onRowClick: (r: ProdutoAbandonado) => void
}): JSX.Element {
  const columns: DataTableColumn<ProdutoAbandonado>[] = useMemo(
    () => [
      { key: 'nome', header: 'Produto', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'etiqueta',
        header: 'Etiqueta',
        render: (r) => <EtiquetaChip etiqueta={r.etiqueta} />
      },
      {
        key: 'ultimaVenda',
        header: 'Última venda',
        align: 'right',
        sortValue: (r) => r.ultimaVenda ?? '',
        render: (r) => dataBr(r.ultimaVenda)
      },
      {
        key: 'meses',
        header: 'Meses com venda',
        align: 'right',
        sortValue: (r) => r.mesesComVenda,
        render: (r) => `${r.mesesComVenda.toLocaleString('pt-BR')} / 6`
      },
      {
        key: 'qtd6m',
        header: 'Qtd. últimos 6 meses',
        align: 'right',
        sortValue: (r) => r.quantidadeUltimos6Meses,
        render: (r) => qtd(r.quantidadeUltimos6Meses)
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Vendiam bem e pararam"
      icone="history_toggle_off"
      descricao="Produtos que vendiam com regularidade nos últimos 6 meses mas não venderam nada nos últimos 30 dias."
      itens={produtos}
      vazioMensagem="Nenhum produto com histórico forte deixou de vender recentemente."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'qtd6m', dir: 'desc' }}
    />
  )
}

// ─────────────────────────────────────────── Seções de Insumos

function SecaoCapitalParado({
  insumos,
  onRowClick
}: {
  insumos: InsumoCapitalParado[]
  onRowClick: (r: InsumoCapitalParado) => void
}): JSX.Element {
  const columns: DataTableColumn<InsumoCapitalParado>[] = useMemo(
    () => [
      { key: 'nome', header: 'Insumo', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'estoque',
        header: 'Estoque atual',
        align: 'right',
        sortValue: (r) => r.estoqueAtual,
        render: (r) => qtdComSigla(r.estoqueAtual, r.sigla)
      },
      {
        key: 'custoParado',
        header: 'Capital parado',
        align: 'right',
        sortValue: (r) => r.custoEstoqueParado,
        render: (r) => <span className="text-error font-bold">{brl(r.custoEstoqueParado)}</span>
      },
      {
        key: 'ultimoUso',
        header: 'Último uso',
        align: 'right',
        sortValue: (r) => r.ultimoUso ?? '',
        render: (r) => dataBr(r.ultimoUso)
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Capital parado"
      icone="savings"
      destaque
      descricao="Insumos com estoque em mãos mas sem (ou quase sem) consumo no período — dinheiro imobilizado na prateleira."
      itens={insumos}
      vazioMensagem="Nenhum insumo com estoque relevante deixou de ser consumido."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'custoParado', dir: 'desc' }}
    />
  )
}

function SecaoPoucoUtilizados({
  insumos,
  onRowClick
}: {
  insumos: InsumoPoucoUtilizado[]
  onRowClick: (r: InsumoPoucoUtilizado) => void
}): JSX.Element {
  const columns: DataTableColumn<InsumoPoucoUtilizado>[] = useMemo(
    () => [
      {
        key: 'nome',
        header: 'Insumo',
        sortValue: (r) => r.nome,
        render: (r) => <CelulaNome nome={r.nome} novo={r.novo} />
      },
      {
        key: 'consumo',
        header: 'Consumo no período',
        align: 'right',
        sortValue: (r) => r.quantidadeConsumida,
        render: (r) => qtdComSigla(r.quantidadeConsumida, r.sigla)
      },
      {
        key: 'custo',
        header: 'Custo consumido',
        align: 'right',
        sortValue: (r) => r.custoConsumido,
        render: (r) => brl(r.custoConsumido)
      },
      {
        key: 'ultimoUso',
        header: 'Último uso',
        align: 'right',
        sortValue: (r) => r.ultimoUso ?? '',
        render: (r) => dataBr(r.ultimoUso)
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Pouco ou nada utilizados"
      icone="inventory"
      descricao="Insumos ativos com o menor consumo no período. O selo “novo” marca itens cadastrados há menos de 30 dias."
      itens={insumos}
      vazioMensagem="Todos os insumos ativos tiveram consumo relevante no período."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'consumo', dir: 'asc' }}
    />
  )
}

function SecaoQuedaConsumo({
  insumos,
  onRowClick
}: {
  insumos: InsumoQuedaConsumo[]
  onRowClick: (r: InsumoQuedaConsumo) => void
}): JSX.Element {
  const columns: DataTableColumn<InsumoQuedaConsumo>[] = useMemo(
    () => [
      { key: 'nome', header: 'Insumo', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'anterior',
        header: 'Consumo anterior',
        align: 'right',
        sortValue: (r) => r.quantidadeAnterior,
        render: (r) => qtdComSigla(r.quantidadeAnterior, r.sigla)
      },
      {
        key: 'atual',
        header: 'Consumo atual',
        align: 'right',
        sortValue: (r) => r.quantidadeAtual,
        render: (r) => qtdComSigla(r.quantidadeAtual, r.sigla)
      },
      {
        key: 'variacao',
        header: 'Variação',
        align: 'right',
        sortValue: (r) => r.variacaoPercentual,
        render: (r) => <BarraQueda valor={r.variacaoPercentual} />
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Utilização caiu"
      icone="trending_down"
      descricao="Insumos cujo consumo mais caiu frente ao período anterior de mesma duração."
      itens={insumos}
      vazioMensagem="Nenhum insumo caiu significativamente no consumo frente ao período anterior."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'variacao', dir: 'asc' }}
    />
  )
}

/** Badge ⚠ com o z-score do consumo da última semana vs o próprio histórico do insumo. */
const BadgeZScore = ({ valor }: { valor: number }): JSX.Element => (
  <span className="inline-flex items-center gap-1 text-error justify-end w-full whitespace-nowrap">
    <span className="material-symbols-outlined text-sm">warning</span>
    {`z ${valor > 0 ? '+' : ''}${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`}
  </span>
)

function SecaoForaDoPadrao({
  insumos,
  onRowClick
}: {
  insumos: InsumoForaDoPadrao[]
  onRowClick: (r: InsumoForaDoPadrao) => void
}): JSX.Element {
  const columns: DataTableColumn<InsumoForaDoPadrao>[] = useMemo(
    () => [
      { key: 'nome', header: 'Insumo', sortValue: (r) => r.nome, render: (r) => r.nome },
      {
        key: 'ultimaSemana',
        header: 'Consumo última semana',
        align: 'right',
        sortValue: (r) => r.consumoUltimaSemana,
        render: (r) => qtdComSigla(r.consumoUltimaSemana, r.sigla)
      },
      {
        key: 'media',
        header: 'Média semanal',
        align: 'right',
        sortValue: (r) => r.mediaSemanal,
        render: (r) => qtdComSigla(r.mediaSemanal, r.sigla)
      },
      {
        key: 'desvio',
        header: 'Desvio padrão',
        align: 'right',
        sortValue: (r) => r.desvioPadrao,
        render: (r) => qtdComSigla(r.desvioPadrao, r.sigla)
      },
      {
        key: 'zscore',
        header: 'Anomalia (z-score)',
        align: 'right',
        sortValue: (r) => Math.abs(r.zScore),
        render: (r) => <BadgeZScore valor={r.zScore} />
      }
    ],
    []
  )

  return (
    <Secao
      titulo="Consumo fora do padrão"
      icone="warning"
      descricao="Insumos cujo consumo na última semana se afastou muito da própria média histórica (|z-score| alto) — pode indicar desperdício ou erro de lançamento."
      itens={insumos}
      vazioMensagem="Nenhum insumo com consumo fora do padrão na última semana."
      columns={columns}
      rowKey={(r) => r.id}
      onRowClick={onRowClick}
      initialSort={{ key: 'zscore', dir: 'desc' }}
    />
  )
}
