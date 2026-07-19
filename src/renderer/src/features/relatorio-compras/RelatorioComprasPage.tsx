import { JSX, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'
import { DataTable, DataTableColumn } from '@renderer/components/DataTable'
import { normalizar } from '@renderer/features/busca/matching'

// ─────────────────────────────────────────── Tipos (espelho dos DTOs F5-02)

type ValorPrevisto = {
  total: number
  limiteInferior: number
  limiteSuperior: number
  metodo: string
  mape: number | null
}
type Feriado = { data: string; nome: string; categoria: string }
type Panorama = {
  faturamento: ValorPrevisto
  pedidos: ValorPrevisto
  datasEspeciais: Feriado[]
}
type LinhaCompra = {
  id: string
  nome: string
  siglaUnidadeDeMedida: string
  consumoPrevisto: number
  custoPrevisto: number
  estoqueAtual: number | null
  estoqueConfiavel: boolean
  estoqueSeguranca: number
  margemSeguranca: string
  compraRecomendada: number
  custoCompraRecomendada: number
  riscoRuptura: string
  diasCobertura: number | null
  excesso: boolean
  justificativa: string
}
type RelatorioCompras = {
  geradoEm: string
  horizonteInicio: string
  horizonteFim: string
  horizonteDias: number
  baseHistorica: string
  panorama: Panorama
  compras: LinhaCompra[]
  avisos: string[]
}

// ─────────────────────────────────────────── Formatação

const brl = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const qtd = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
const qtdSigla = (n: number, sigla: string): string => `${qtd(n)} ${sigla}`.trim()
const inteiro = (n: number): string => Math.round(n).toLocaleString('pt-BR')
const dataBr = (iso: string): string => format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR })
const dataExtenso = (iso: string): string =>
  format(parseISO(iso), "dd 'de' MMMM", { locale: ptBR })

const NOME_METODO: Record<string, string> = {
  HOLT_WINTERS: 'Holt-Winters',
  NAIVE_SAZONAL: 'Sazonal (baseline)'
}
const nomeMetodo = (m: string): string => NOME_METODO[m] ?? m

/** Horizontes oferecidos (o backend aceita sufixos d/s/m/a via parseHorizonte). */
const HORIZONTES: { valor: string; rotulo: string }[] = [
  { valor: '7d', rotulo: 'Próxima semana' },
  { valor: '30d', rotulo: 'Próximo mês' },
  { valor: '90d', rotulo: 'Próximos 3 meses' }
]

// Prioridade do semáforo p/ ordenação (maior = mais urgente).
const PRIORIDADE_RISCO: Record<string, number> = { alto: 3, medio: 2, baixo: 1 }

// ─────────────────────────────────────────── Página

export const RelatorioComprasPage = (): JSX.Element => {
  const [horizonte, setHorizonte] = useState('30d')
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['relatorio-compras', horizonte],
    queryFn: (): Promise<RelatorioCompras> =>
      httpClient.get<RelatorioCompras>({
        url: `/relatorios/previsao-compras?horizonte=${horizonte}`
      })
  })

  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <header className="flex justify-between items-start gap-4 flex-wrap border-b border-outline-variant pb-stack-md">
        <div>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            Relatório de compras
          </span>
          <h1 className="font-h1 text-primary text-h2 sm:text-h1 mt-1">Previsão de compras</h1>
          <p className="text-sm text-on-surface-variant opacity-70 mt-1 max-w-2xl">
            Estimativa do que comprar para o próximo período, a partir da previsão de consumo e do
            estoque atual. É apoio à decisão — não uma ordem de compra.
          </p>
        </div>
        <HorizonteTabs horizonte={horizonte} onChange={setHorizonte} />
      </header>

      <QueryStateBoundary
        query={query}
        loadingPlaceholder={<RelatorioSkeleton />}
        isEmpty={() => false}
      >
        {(data) => <RelatorioCorpo data={data} />}
      </QueryStateBoundary>

      <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
        <div>© 2026 Restaurante Syriana. All rights reserved.</div>
        <div>Relatório de previsão para compras</div>
      </footer>
    </section>
  )
}

/** Seletor de horizonte (segmented control, mesmo padrão das abas de saúde). */
const HorizonteTabs = ({
  horizonte,
  onChange
}: {
  horizonte: string
  onChange: (h: string) => void
}): JSX.Element => (
  <div className="inline-flex gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
    {HORIZONTES.map(({ valor, rotulo }) => {
      const ativo = horizonte === valor
      return (
        <button
          key={valor}
          type="button"
          onClick={() => onChange(valor)}
          className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
            ativo
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'text-on-surface-variant opacity-70 hover:opacity-100 border border-transparent'
          }`}
        >
          {rotulo}
        </button>
      )
    })}
  </div>
)

const RelatorioSkeleton = (): JSX.Element => (
  <div className="space-y-gutter">
    <div className="h-24 rounded-xl shimmer-container" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <div className="h-40 rounded-xl shimmer-container" />
      <div className="h-40 rounded-xl shimmer-container" />
    </div>
    <div className="h-96 rounded-xl shimmer-container" />
  </div>
)

// ─────────────────────────────────────────── Corpo

const RelatorioCorpo = ({ data }: { data: RelatorioCompras }): JSX.Element => (
  <div className="space-y-stack-lg">
    <Cabecalho data={data} />
    <PanoramaSecao panorama={data.panorama} />
    <TabelaCompras linhas={data.compras} />
    <Avisos avisos={data.avisos} />
  </div>
)

// ─────────────────────────────────────────── Cabeçalho

const Cabecalho = ({ data }: { data: RelatorioCompras }): JSX.Element => (
  <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-wrap gap-stack-lg">
    <InfoCabecalho
      icone="event"
      rotulo="Período previsto"
      valor={`${dataBr(data.horizonteInicio)} – ${dataBr(data.horizonteFim)}`}
      detalhe={`${data.horizonteDias.toLocaleString('pt-BR')} dias`}
    />
    <InfoCabecalho
      icone="database"
      rotulo="Base histórica"
      valor={data.baseHistorica}
      largura="max-w-md"
    />
    <InfoCabecalho
      icone="update"
      rotulo="Gerado em"
      valor={dataBr(data.geradoEm)}
    />
  </div>
)

const InfoCabecalho = ({
  icone,
  rotulo,
  valor,
  detalhe,
  largura
}: {
  icone: string
  rotulo: string
  valor: string
  detalhe?: string
  largura?: string
}): JSX.Element => (
  <div className={`flex items-start gap-2 ${largura ?? ''}`}>
    <span className="material-symbols-outlined text-primary opacity-80 text-xl">{icone}</span>
    <div>
      <div className="font-label-caps text-label-caps text-on-surface-variant opacity-70">
        {rotulo}
      </div>
      <div className="text-sm text-on-surface font-bold mt-0.5">{valor}</div>
      {detalhe && <div className="text-xs text-on-surface-variant opacity-60">{detalhe}</div>}
    </div>
  </div>
)

// ─────────────────────────────────────────── Panorama

const PanoramaSecao = ({ panorama }: { panorama: Panorama }): JSX.Element => (
  <div className="space-y-stack-md">
    <div className="flex items-baseline gap-2">
      <span className="material-symbols-outlined text-lg text-primary opacity-70">insights</span>
      <h2 className="font-h2 text-h3 text-on-surface">Panorama do período</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <CardPrevisto
        titulo="Faturamento previsto"
        icone="payments"
        valor={panorama.faturamento}
        formata={brl}
      />
      <CardPrevisto
        titulo="Pedidos previstos"
        icone="receipt_long"
        valor={panorama.pedidos}
        formata={(n) => inteiro(n)}
      />
    </div>
    <DatasEspeciais datas={panorama.datasEspeciais} />
  </div>
)

const CardPrevisto = ({
  titulo,
  icone,
  valor,
  formata
}: {
  titulo: string
  icone: string
  valor: ValorPrevisto
  formata: (n: number) => string
}): JSX.Element => (
  <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding">
    <div className="flex items-center gap-2 text-on-surface-variant">
      <span className="material-symbols-outlined text-lg text-primary opacity-80">{icone}</span>
      <span className="font-label-caps text-label-caps">{titulo}</span>
    </div>
    <div className="font-data-display text-data-display text-on-surface mt-stack-sm">
      {formata(valor.total)}
    </div>
    <div className="text-xs text-on-surface-variant opacity-70 mt-1">
      Faixa: {formata(valor.limiteInferior)} – {formata(valor.limiteSuperior)}
    </div>
    <div className="text-xs text-on-surface-variant opacity-60 mt-2 flex items-center gap-1.5 flex-wrap">
      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
        {nomeMetodo(valor.metodo)}
      </span>
      {valor.mape != null && (
        <span>erro médio ±{valor.mape.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</span>
      )}
    </div>
  </div>
)

const DatasEspeciais = ({ datas }: { datas: Feriado[] }): JSX.Element | null => {
  if (datas.length === 0) return null
  return (
    <div className="bg-primary/5 border border-primary/25 rounded-xl p-container-padding">
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-lg">celebration</span>
        <span className="font-label-caps text-label-caps">Datas especiais do período</span>
      </div>
      <p className="text-xs text-on-surface-variant opacity-70 mt-1">
        Datas comemorativas costumam ser os maiores dias de venda do ano — já entram na previsão e
        puxam a compra de insumos para cima.
      </p>
      <ul className="mt-stack-sm flex flex-wrap gap-2">
        {datas.map((f) => (
          <li
            key={`${f.data}-${f.nome}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-sm"
          >
            <span className="text-primary font-bold">{f.nome}</span>
            <span className="text-on-surface-variant opacity-70">{dataExtenso(f.data)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─────────────────────────────────────────── Tabela de compras

/** Ao clicar numa linha, abre os detalhes do insumo com os últimos 90 dias. */
const abrirInsumo = (linha: LinhaCompra): void => {
  const hoje = new Date()
  const dataFim = format(hoje, 'yyyy-MM-dd')
  const dataInicio = format(subDays(hoje, 90), 'yyyy-MM-dd')
  window.electron.openWindow(
    `/insumo-details/${linha.id}?dataInicio=${dataInicio}&dataFim=${dataFim}`,
    {
      width: 640,
      height: 760,
      resizable: true,
      maximizable: true,
      minimizable: true,
      title: linha.nome,
      center: true
    }
  )
}

const RiscoBadge = ({ risco }: { risco: string }): JSX.Element => {
  const cfg: Record<string, { cor: string; rotulo: string }> = {
    alto: { cor: 'text-error', rotulo: 'Alto' },
    medio: { cor: 'text-amber-400', rotulo: 'Médio' },
    baixo: { cor: 'text-emerald-400', rotulo: 'Baixo' }
  }
  const { cor, rotulo } = cfg[risco] ?? { cor: 'text-on-surface-variant', rotulo: risco }
  return (
    <span className={`inline-flex items-center gap-1.5 justify-end w-full ${cor}`}>
      <span className="material-symbols-outlined text-[14px]">circle</span>
      {rotulo}
    </span>
  )
}

/** Célula de estoque: valor + sigla, ou aviso ⚠ quando o saldo não é confiável. */
const CelulaEstoque = ({ linha }: { linha: LinhaCompra }): JSX.Element => {
  if (!linha.estoqueConfiavel) {
    return (
      <span className="inline-flex items-center gap-1 text-error justify-end w-full whitespace-nowrap">
        <span className="material-symbols-outlined text-[14px]">warning</span>
        não confiável
      </span>
    )
  }
  return <span>{qtdSigla(linha.estoqueAtual ?? 0, linha.siglaUnidadeDeMedida)}</span>
}

const TabelaCompras = ({ linhas }: { linhas: LinhaCompra[] }): JSX.Element => {
  const [busca, setBusca] = useState('')
  const [soRisco, setSoRisco] = useState(false)
  const [soNaoConfiavel, setSoNaoConfiavel] = useState(false)

  const filtradas = useMemo(() => {
    const termo = normalizar(busca)
    return linhas.filter((l) => {
      if (termo && !normalizar(l.nome).includes(termo)) return false
      if (soRisco && l.riscoRuptura === 'baixo') return false
      if (soNaoConfiavel && l.estoqueConfiavel) return false
      return true
    })
  }, [linhas, busca, soRisco, soNaoConfiavel])

  const columns: DataTableColumn<LinhaCompra>[] = useMemo(
    () => [
      {
        key: 'nome',
        header: 'Insumo',
        sortValue: (r) => r.nome,
        render: (r) => (
          <span title={r.justificativa} className="cursor-help border-b border-dotted border-outline-variant">
            {r.nome}
          </span>
        )
      },
      {
        key: 'consumo',
        header: 'Consumo previsto',
        align: 'right',
        sortValue: (r) => r.consumoPrevisto,
        render: (r) => qtdSigla(r.consumoPrevisto, r.siglaUnidadeDeMedida)
      },
      {
        key: 'estoque',
        header: 'Estoque atual',
        align: 'right',
        sortValue: (r) => (r.estoqueConfiavel ? (r.estoqueAtual ?? 0) : Number.NEGATIVE_INFINITY),
        render: (r) => <CelulaEstoque linha={r} />
      },
      {
        key: 'seguranca',
        header: 'Segurança',
        align: 'right',
        sortValue: (r) => r.estoqueSeguranca,
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 justify-end w-full">
            {qtdSigla(r.estoqueSeguranca, r.siglaUnidadeDeMedida)}
            <span className="text-[10px] text-on-surface-variant opacity-60 uppercase">
              {r.margemSeguranca}
            </span>
          </span>
        )
      },
      {
        key: 'compra',
        header: 'Compra recomendada',
        align: 'right',
        sortValue: (r) => r.compraRecomendada,
        render: (r) =>
          r.compraRecomendada > 0 ? (
            <span className="text-primary font-bold">
              {qtdSigla(r.compraRecomendada, r.siglaUnidadeDeMedida)}
            </span>
          ) : (
            <span className="text-on-surface-variant opacity-50">—</span>
          )
      },
      {
        key: 'custoCompra',
        header: 'Custo estimado',
        align: 'right',
        sortValue: (r) => r.custoCompraRecomendada,
        render: (r) =>
          r.compraRecomendada > 0 ? (
            brl(r.custoCompraRecomendada)
          ) : (
            <span className="text-on-surface-variant opacity-50">—</span>
          )
      },
      {
        key: 'cobertura',
        header: 'Cobertura',
        align: 'right',
        sortValue: (r) => r.diasCobertura ?? Number.POSITIVE_INFINITY,
        render: (r) =>
          r.diasCobertura == null ? (
            <span className="text-on-surface-variant opacity-50">—</span>
          ) : (
            `${r.diasCobertura.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} d`
          )
      },
      {
        key: 'risco',
        header: 'Risco de ruptura',
        align: 'right',
        sortValue: (r) => PRIORIDADE_RISCO[r.riscoRuptura] ?? 0,
        render: (r) => <RiscoBadge risco={r.riscoRuptura} />
      },
      {
        key: 'excesso',
        header: 'Excesso',
        align: 'right',
        sortValue: (r) => (r.excesso ? 1 : 0),
        render: (r) =>
          r.excesso ? (
            <span className="inline-flex items-center gap-1 text-amber-400 justify-end w-full whitespace-nowrap">
              <span className="material-symbols-outlined text-[14px]">savings</span>
              capital parado
            </span>
          ) : (
            <span className="text-on-surface-variant opacity-50">—</span>
          )
      }
    ],
    []
  )

  return (
    <div className="space-y-stack-md">
      <div className="flex items-baseline gap-2">
        <span className="material-symbols-outlined text-lg text-primary opacity-70">
          shopping_cart
        </span>
        <h2 className="font-h2 text-h3 text-on-surface">Tabela de compras</h2>
        <span className="text-xs text-on-surface-variant opacity-60">
          {linhas.length.toLocaleString('pt-BR')} insumos
        </span>
      </div>
      <p className="text-sm text-on-surface-variant opacity-70 -mt-1">
        Uma linha por insumo consumido recentemente. Passe o mouse sobre o nome para ver a
        justificativa; clique numa linha para abrir o histórico do insumo (últimos 90 dias).
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 w-[260px] focus-within:border-primary/40 transition-colors">
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
        <div className="flex items-center gap-2">
          <FiltroToggle
            ativo={soRisco}
            onClick={() => setSoRisco((v) => !v)}
            icone="warning"
            rotulo="Com risco"
          />
          <FiltroToggle
            ativo={soNaoConfiavel}
            onClick={() => setSoNaoConfiavel((v) => !v)}
            icone="report"
            rotulo="Estoque ⚠"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding flex flex-col items-center gap-stack-sm text-center">
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-3xl">
            {linhas.length === 0 ? 'inventory_2' : 'search_off'}
          </span>
          <p className="text-sm text-on-surface-variant opacity-70">
            {linhas.length === 0
              ? 'Sem histórico de consumo recente — não foi possível projetar compras.'
              : 'Nenhum insumo corresponde aos filtros.'}
          </p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={filtradas}
            rowKey={(r) => r.id}
            onRowClick={abrirInsumo}
            initialSort={{ key: 'risco', dir: 'desc' }}
          />
          <p className="text-xs text-on-surface-variant opacity-60">
            {filtradas.length} de {linhas.length} insumos.
          </p>
        </>
      )}
    </div>
  )
}

const FiltroToggle = ({
  ativo,
  onClick,
  icone,
  rotulo
}: {
  ativo: boolean
  onClick: () => void
  icone: string
  rotulo: string
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-bold rounded-lg flex items-center gap-1.5 border transition-colors ${
      ativo
        ? 'bg-primary/10 text-primary border-primary/30'
        : 'text-on-surface-variant opacity-70 hover:opacity-100 border-outline-variant'
    }`}
  >
    <span className="material-symbols-outlined text-base">{icone}</span>
    {rotulo}
  </button>
)

// ─────────────────────────────────────────── Avisos

const Avisos = ({ avisos }: { avisos: string[] }): JSX.Element | null => {
  if (avisos.length === 0) return null
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-container-padding">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <span className="material-symbols-outlined text-lg text-primary opacity-80">info</span>
        <span className="font-label-caps text-label-caps">Avisos e metodologia</span>
      </div>
      <ul className="mt-stack-sm space-y-1.5 list-disc pl-5">
        {avisos.map((aviso, i) => (
          <li key={i} className="text-sm text-on-surface-variant opacity-80">
            {aviso}
          </li>
        ))}
      </ul>
    </div>
  )
}
