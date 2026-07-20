import { JSX, useState } from 'react'
import { VarianteShell } from './VarianteShell'
import { VARIANTES } from './variantes'
import { DadosKpi, useKpi } from './useKpi'
import { MetricaKpi, corDaVariacao } from './metricas'
import { SparklineDeArea, Variacao } from './partes'
import { estadoDoKpi } from './estados'
import { TiraPrevisao } from './CardPrevisao'
import { KpiDetalheModal } from './KpiDetalheModal'

const variante = VARIANTES[2]

const COR_NEUTRA = 'rgba(229,196,131,0.7)'

function corDaSerieDoKpi(kpi: DadosKpi): string {
  const principal = kpi.comparacoes[0]
  return principal ? corDaVariacao(principal.percent, kpi.descritor.maiorEhMelhor) : COR_NEUTRA
}

type AoAbrir = (metrica: MetricaKpi) => void

/**
 * Card principal: a métrica que o gerente olha primeiro ocupa o dobro do
 * espaço e ganha a série de 30 dias em tamanho legível. Sem hierarquia, os
 * cinco cards gritavam no mesmo volume e nenhum era lido primeiro.
 */
const CardDestaque = ({ onAbrir }: { onAbrir: AoAbrir }): JSX.Element => {
  const kpi = useKpi('faturamento')
  const estado = estadoDoKpi(kpi)
  const principal = kpi.comparacoes[0]

  return (
    <button
      onClick={() => onAbrir('faturamento')}
      className="xl:col-span-2 text-left bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md relative min-h-[220px] flex flex-col hover:border-primary/50 transition-colors group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />

      <div className="flex justify-between items-start">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {kpi.descritor.titulo}
        </span>
        <span className="material-symbols-outlined text-primary opacity-40 group-hover:opacity-90 transition-opacity">
          open_in_full
        </span>
      </div>

      {estado ?? (
        <>
          <div className="mt-stack-sm font-data-display text-primary font-bold text-5xl leading-none">
            {kpi.texto}
          </div>

          {principal && (
            <Variacao
              comparacao={principal}
              maiorEhMelhor={kpi.descritor.maiorEhMelhor}
              className="mt-stack-sm text-sm"
            />
          )}

          <div className="mt-auto pt-4">
            <SparklineDeArea
              values={kpi.serie}
              color={corDaSerieDoKpi(kpi)}
              width={400}
              height={64}
              className="w-full"
            />
            <div className="mt-1 text-[10px] text-on-surface-variant opacity-50">
              Últimos 30 dias
            </div>
          </div>
        </>
      )}
    </button>
  )
}

/**
 * Métrica secundária: valor e uma variação. Sem sparkline — no card pequeno ela
 * virava enfeite ilegível. Quem quiser a série abre o detalhe.
 */
const LinhaSecundaria = ({
  metrica,
  onAbrir
}: {
  metrica: MetricaKpi
  onAbrir: AoAbrir
}): JSX.Element => {
  const kpi = useKpi(metrica)
  const estado = estadoDoKpi(kpi)
  const principal = kpi.comparacoes[0]

  return (
    <button
      onClick={() => onAbrir(metrica)}
      className="w-full text-left bg-surface-container px-card-padding py-3 rounded-xl border border-outline-variant shadow-md flex items-center gap-4 hover:border-primary/50 transition-colors"
    >
      <span className="material-symbols-outlined text-primary opacity-50 shrink-0">
        {kpi.descritor.icone}
      </span>

      <div className="min-w-0 flex-1">
        <div className="font-label-caps text-label-caps text-on-surface-variant">
          {kpi.descritor.titulo}
        </div>
        {estado ?? (
          <div className="font-data-display text-primary font-bold text-2xl leading-tight truncate">
            {kpi.textoCurto}
          </div>
        )}
      </div>

      {!estado && principal && (
        <Variacao
          comparacao={principal}
          maiorEhMelhor={kpi.descritor.maiorEhMelhor}
          comRotulo={false}
          className="text-sm shrink-0"
        />
      )}
    </button>
  )
}

export const Dashboard3Page = (): JSX.Element => {
  const [detalhe, setDetalhe] = useState<MetricaKpi | null>(null)

  return (
    <VarianteShell variante={variante}>
      <div className="space-y-gutter">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-gutter">
          <CardDestaque onAbrir={setDetalhe} />

          <div className="xl:col-span-2 flex flex-col gap-gutter">
            <LinhaSecundaria metrica="lucro" onAbrir={setDetalhe} />
            <LinhaSecundaria metrica="pedidos" onAbrir={setDetalhe} />
            <LinhaSecundaria metrica="custo" onAbrir={setDetalhe} />
          </div>
        </div>

        <TiraPrevisao />

        <KpiDetalheModal metrica={detalhe} onClose={() => setDetalhe(null)} />
      </div>
    </VarianteShell>
  )
}
