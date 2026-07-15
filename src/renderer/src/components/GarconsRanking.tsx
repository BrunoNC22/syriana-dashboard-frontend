import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { QueryStateBoundary } from '@renderer/components/query-state/QueryStateBoundary'

type GarcomResumo = {
  id: number
  nome: string
  totalTaxaServico: number
  faturamento: number
  custo: number
  lucro: number
  comandas: number
  itensLancados: number
}

/**
 * Tela de garçons: cards de resumo do período + ranking por comissão (10%).
 * Cada garçom é um card clicável (abre o detalhe em modal nativo) com uma barra
 * proporcional ao maior valor a receber.
 */
export const GarconsRanking = (): React.JSX.Element => {
  const { startISO, endISO } = useApplicationDate()
  const { httpClient } = useHttpClient()

  const query = useQuery({
    queryKey: ['garcons-ranking', startISO, endISO],
    queryFn: (): Promise<GarcomResumo[]> =>
      httpClient.get<GarcomResumo[]>({
        url: `/garcons?dataInicio=${startISO}&dataFim=${endISO}`
      })
  })

  const brl = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  )

  const abrirDetalhe = (g: GarcomResumo): void => {
    window.electron.openModal(`/garcons/${g.id}?dataInicio=${startISO}&dataFim=${endISO}`, {
      width: 640,
      height: 760,
      resizable: true,
      maximizable: true,
      minimizable: true,
      title: g.nome,
      center: true
    })
  }

  return (
    <QueryStateBoundary
      query={query}
      isEmpty={(d) => d.length === 0}
      emptyMessage="Nenhum garçom com pedidos neste período."
      loadingPlaceholder={
        <div className="space-y-gutter">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl shimmer-container" />
            ))}
          </div>
          <div className="h-96 rounded-xl shimmer-container" />
        </div>
      }
    >
      {(garcons) => {
        const totalAReceber = garcons.reduce((s, g) => s + g.totalTaxaServico, 0)
        const totalFaturamento = garcons.reduce((s, g) => s + g.faturamento, 0)
        const totalLucro = garcons.reduce((s, g) => s + g.lucro, 0)
        const maxTaxa = Math.max(...garcons.map((g) => g.totalTaxaServico), 0)

        return (
          <div className="space-y-gutter">
            {/* Resumo do período */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
              <SummaryCard
                icon="payments"
                label="Total a pagar (10%)"
                value={brl.format(totalAReceber)}
                highlight
              />
              <SummaryCard
                icon="receipt_long"
                label="Faturamento"
                value={brl.format(totalFaturamento)}
              />
              <SummaryCard
                icon={totalLucro >= 0 ? 'trending_up' : 'trending_down'}
                label="Lucro"
                value={brl.format(totalLucro)}
              />
              <SummaryCard
                icon="groups"
                label="Garçons ativos"
                value={garcons.length.toLocaleString('pt-BR')}
              />
            </div>

            {/* Ranking */}
            <div className="space-y-stack-md">
              <div className="flex items-center justify-between">
                <h2 className="font-label-caps text-label-caps text-on-surface-variant">
                  Ranking por comissão (10%)
                </h2>
                <span className="text-xs text-on-surface-variant opacity-60">
                  Clique num garçom para ver o detalhe
                </span>
              </div>

              <div className="space-y-stack-sm">
                {garcons.map((g, i) => {
                  const pct = maxTaxa > 0 ? Math.max((g.totalTaxaServico / maxTaxa) * 100, 2) : 0
                  return (
                    <button
                      key={g.id}
                      onClick={() => abrirDetalhe(g)}
                      className="w-full text-left bg-surface-container rounded-xl border border-outline-variant shadow-md p-card-padding hover:border-primary/40 hover:bg-surface-container-high transition-colors flex items-center gap-stack-md group"
                    >
                      <RankBadge posicao={i + 1} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medium text-on-surface truncate group-hover:text-primary transition-colors">
                            {g.nome}
                          </span>
                          <span className="font-data-display text-lg font-bold text-primary whitespace-nowrap">
                            {brl.format(g.totalTaxaServico)}
                          </span>
                        </div>

                        {/* Barra proporcional ao maior valor a receber */}
                        <div className="mt-stack-sm h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-stack-sm flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                          <InlineStat icon="receipt_long" texto={brl.format(g.faturamento)} />
                          <InlineStat
                            icon={g.lucro >= 0 ? 'trending_up' : 'trending_down'}
                            texto={brl.format(g.lucro)}
                            className={g.lucro >= 0 ? undefined : 'text-error'}
                          />
                          <InlineStat
                            icon="table_restaurant"
                            texto={`${g.comandas.toLocaleString('pt-BR')} comandas`}
                          />
                          <InlineStat
                            icon="list_alt"
                            texto={`${g.itensLancados.toLocaleString('pt-BR')} itens`}
                          />
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all">
                        chevron_right
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }}
    </QueryStateBoundary>
  )
}

const SummaryCard = ({
  icon,
  label,
  value,
  highlight = false
}: {
  icon: string
  label: string
  value: string
  highlight?: boolean
}): React.JSX.Element => (
  <div className="bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
    <div className="flex justify-between items-start mb-stack-sm">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      <span className="material-symbols-outlined text-primary opacity-50 text-lg">{icon}</span>
    </div>
    <div
      className={`font-data-display font-bold ${
        highlight ? 'text-2xl text-primary' : 'text-xl text-on-surface'
      }`}
    >
      {value}
    </div>
  </div>
)

const RankBadge = ({ posicao }: { posicao: number }): React.JSX.Element => {
  const isTop = posicao === 1
  return (
    <div
      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-data-display font-bold text-sm ${
        isTop
          ? 'bg-primary text-background'
          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
      }`}
    >
      {posicao}
    </div>
  )
}

const InlineStat = ({
  icon,
  texto,
  className
}: {
  icon: string
  texto: string
  className?: string
}): React.JSX.Element => (
  <span className={`flex items-center gap-1 whitespace-nowrap ${className ?? ''}`}>
    <span className="material-symbols-outlined text-sm opacity-60">{icon}</span>
    {texto}
  </span>
)
