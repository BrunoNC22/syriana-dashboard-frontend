import { JSX, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useKpi } from './useKpi'
import { CORES_TENDENCIA, MetricaKpi, corDaVariacao, formatarValor } from './metricas'
import { SparklineDeArea, Variacao } from './partes'
import { resumoDaSerie } from './estados'

function dataCurta(iso: string | undefined): string {
  if (!iso) return '—'
  return format(parseISO(iso), "dd 'de' MMM", { locale: ptBR })
}

const Linha = ({
  rotulo,
  children
}: {
  rotulo: string
  children: JSX.Element | string
}): JSX.Element => (
  <div className="flex justify-between items-center gap-4 py-2 border-b border-outline-variant/50 last:border-0">
    <span className="text-sm text-on-surface-variant opacity-70">{rotulo}</span>
    <span className="text-sm text-on-surface-variant font-bold text-right">{children}</span>
  </div>
)

/**
 * Corpo do modal. Componente separado para poder chamar `useKpi` — o modal
 * externo só existe quando há métrica selecionada, e um hook não pode ser
 * chamado condicionalmente. Buscar os dados aqui (em vez de receber um snapshot
 * do card) mantém o detalhe vivo: se a query revalidar, o modal acompanha.
 */
const ConteudoDetalhe = ({ metrica }: { metrica: MetricaKpi }): JSX.Element => {
  const kpi = useKpi(metrica)
  const { range } = useApplicationDate()

  const resumo = resumoDaSerie(kpi)
  const { formato, maiorEhMelhor } = kpi.descritor
  const principal = kpi.comparacoes[0]
  const corDaSerie = principal
    ? corDaVariacao(principal.percent, maiorEhMelhor)
    : CORES_TENDENCIA.neutra

  return (
    <>
      <div className="p-card-padding border-b border-outline-variant flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">{kpi.descritor.icone}</span>
        <div>
          <h2 className="font-h2 text-primary text-h3">{kpi.descritor.titulo}</h2>
          <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
            {format(range.start, 'dd/MM/yyyy')} — {format(range.end, 'dd/MM/yyyy')}
          </p>
        </div>
      </div>

      <div className="p-card-padding space-y-gutter">
        <div className="font-data-display text-primary font-bold text-4xl leading-none">
          {kpi.isEmpty ? '—' : kpi.texto}
        </div>

        {kpi.comparacoes.length > 0 && (
          <div>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-1">
              Comparações
            </h3>
            {kpi.comparacoes.map((c) => (
              <Linha key={c.label} rotulo={c.label}>
                <Variacao comparacao={c} maiorEhMelhor={maiorEhMelhor} comRotulo={false} />
              </Linha>
            ))}
          </div>
        )}

        {resumo && (
          <div>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">
              Últimos 30 dias
            </h3>
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3">
              <SparklineDeArea
                values={kpi.serie}
                color={corDaSerie}
                width={460}
                height={90}
                className="w-full"
              />
            </div>
            <div className="mt-2">
              <Linha rotulo="Média diária">{formatarValor(resumo.media, formato)}</Linha>
              <Linha rotulo={`Melhor dia · ${dataCurta(resumo.diaMaior)}`}>
                {formatarValor(resumo.maior, formato)}
              </Linha>
              <Linha rotulo={`Pior dia · ${dataCurta(resumo.diaMenor)}`}>
                {formatarValor(resumo.menor, formato)}
              </Linha>
            </div>
          </div>
        )}

        <p className="text-xs text-on-surface-variant opacity-50 leading-relaxed">
          A janela de 30 dias é fixa e independe do período selecionado — ela mostra a tendência
          recente do negócio, não o intervalo do card.
        </p>
      </div>
    </>
  )
}

/**
 * Detalhe de um KPI, num overlay dentro da própria janela.
 *
 * Overlay em vez de `openModal` de propósito: abrir uma `BrowserWindow` para
 * mostrar meia dúzia de números é pesado, e a janela nova perderia o contexto
 * de período e de comparação que já vive nos providers desta.
 */
export const KpiDetalheModal = ({
  metrica,
  onClose
}: {
  metrica: MetricaKpi | null
  onClose: () => void
}): JSX.Element | null => {
  useEffect(() => {
    if (!metrica) return
    const aoTeclar = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [metrica, onClose])

  if (!metrica) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 print:hidden"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <ConteudoDetalhe metrica={metrica} />
      </div>
    </div>
  )
}
