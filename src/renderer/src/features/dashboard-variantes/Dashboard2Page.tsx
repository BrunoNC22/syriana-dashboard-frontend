import { JSX } from 'react'
import { VarianteShell } from './VarianteShell'
import { VARIANTES } from './variantes'
import { DadosKpi, useKpi } from './useKpi'
import { MetricaKpi, corDaVariacao, formatarValor } from './metricas'
import { SparklineDeArea, Variacao } from './partes'
import { estadoDoKpi, resumoDaSerie } from './estados'
import { CardPrevisao } from './CardPrevisao'

const variante = VARIANTES[1]

/**
 * Detalhe revelado no hover.
 *
 * Fica num popover ancorado ao card em vez de expandi-lo, para que a faixa de
 * KPIs não pule de altura quando o mouse passa por cima — o salto é mais
 * incômodo que a informação que ele revela.
 */
const DetalheNoHover = ({ kpi }: { kpi: DadosKpi }): JSX.Element | null => {
  const resumo = resumoDaSerie(kpi)
  const anual = kpi.comparacoes[1]

  if (!resumo && !anual) return null

  const { formato } = kpi.descritor

  return (
    <div className="absolute left-0 right-0 top-full mt-1 z-20 hidden group-hover:block pointer-events-none">
      <div className="bg-surface-container-low border border-outline-variant rounded-xl shadow-xl p-3 space-y-1.5 text-xs text-on-surface-variant">
        {anual && (
          <div className="flex justify-between gap-3">
            <span className="opacity-70">Ano anterior</span>
            <Variacao
              comparacao={anual}
              maiorEhMelhor={kpi.descritor.maiorEhMelhor}
              comRotulo={false}
            />
          </div>
        )}
        {resumo && (
          <>
            <div className="flex justify-between gap-3">
              <span className="opacity-70">Média diária · 30d</span>
              <span className="font-bold">{formatarValor(resumo.media, formato, true)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="opacity-70">Faixa · 30d</span>
              <span className="font-bold">
                {formatarValor(resumo.menor, formato, true)} –{' '}
                {formatarValor(resumo.maior, formato, true)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Card enxuto: título, valor e **uma** linha com sparkline + variação.
 * Sem seta (a cor e o sinal bastam) e sem a segunda comparação, que passou a
 * viver no hover.
 */
const CardEnxuto = ({ metrica }: { metrica: MetricaKpi }): JSX.Element => {
  const kpi = useKpi(metrica)
  const estado = estadoDoKpi(kpi)
  const principal = kpi.comparacoes[0]
  const { maiorEhMelhor } = kpi.descritor

  const corDaSerie = principal
    ? corDaVariacao(principal.percent, maiorEhMelhor)
    : 'rgba(229,196,131,0.7)'

  return (
    <div className="group relative bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md min-h-[150px] hover:border-primary/40 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />

      <div className="flex justify-between items-start mb-stack-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {kpi.descritor.titulo}
        </span>
        <span className="material-symbols-outlined text-primary opacity-50">
          {kpi.descritor.icone}
        </span>
      </div>

      {estado ?? (
        <>
          <div className="font-data-display text-data-display text-primary font-bold leading-none">
            {kpi.texto}
          </div>

          <div className="mt-stack-sm flex items-end justify-between gap-2">
            <SparklineDeArea values={kpi.serie} color={corDaSerie} width={80} height={28} />
            {principal && (
              <Variacao
                comparacao={principal}
                maiorEhMelhor={maiorEhMelhor}
                className="text-xs text-right"
              />
            )}
          </div>

          <DetalheNoHover kpi={kpi} />
        </>
      )}
    </div>
  )
}

export const Dashboard2Page = (): JSX.Element => {
  return (
    <VarianteShell variante={variante}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-gutter">
        <CardEnxuto metrica="faturamento" />
        <CardEnxuto metrica="pedidos" />
        <CardEnxuto metrica="lucro" />
        <CardEnxuto metrica="custo" />
        <CardPrevisao />
      </div>
    </VarianteShell>
  )
}
