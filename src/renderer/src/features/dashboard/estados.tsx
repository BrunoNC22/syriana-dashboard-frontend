import { JSX } from 'react'
import { DadosKpi } from './useKpi'

/**
 * Estados de carregamento, erro e vazio de um card KPI. Devolve `null` quando
 * há dados — o card renderiza o próprio conteúdo nesse caso.
 *
 * É uma função, não um componente, de propósito: os cards fazem
 * `estado ?? conteúdo`, e um elemento JSX seria sempre truthy mesmo quando o
 * componente renderiza `null`, engolindo o conteúdo silenciosamente.
 */
export function estadoDoKpi(kpi: DadosKpi): JSX.Element | null {
  if (kpi.isLoading) return <div className="h-9 w-40 rounded-lg shimmer-container" />

  if (kpi.isError)
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-error text-sm">error_outline</span>
          <p className="font-body-md text-on-surface-variant text-xs">Erro ao carregar</p>
        </div>
        <button
          onClick={(e) => {
            // Os cards das variantes 3 e 4 são clicáveis; sem isto o retry
            // também abriria o modal de detalhe.
            e.stopPropagation()
            kpi.refetch()
          }}
          className="px-2 py-1 border border-primary/20 bg-primary/5 text-primary text-xs font-bold rounded hover:bg-primary/10 transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">refresh</span>
          Tentar novamente
        </button>
      </div>
    )

  if (kpi.isEmpty)
    return (
      <p className="font-body-md text-on-surface-variant opacity-70 text-sm">
        {kpi.descritor.mensagemVazio}
      </p>
    )

  return null
}

export type ResumoDaSerie = {
  menor: number
  maior: number
  media: number
  diaMaior?: string
  diaMenor?: string
}

/** Estatísticas da série de 30 dias, usadas no hover e no modal de detalhe. */
export function resumoDaSerie(kpi: DadosKpi): ResumoDaSerie | null {
  if (kpi.serie.length < 2) return null

  const menor = Math.min(...kpi.serie)
  const maior = Math.max(...kpi.serie)
  const media = kpi.serie.reduce((s, v) => s + v, 0) / kpi.serie.length

  const chave = kpi.descritor.serie
  const diaMaior = kpi.dias.find((d) => d[chave] === maior)?.dia
  const diaMenor = kpi.dias.find((d) => d[chave] === menor)?.dia

  return { menor, maior, media, diaMaior, diaMenor }
}
