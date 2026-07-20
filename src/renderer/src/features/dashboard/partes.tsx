import { JSX, useId } from 'react'
import { KPIComparison } from '@renderer/kpis/usePeriodComparison'
import { corDaVariacao, percentual } from './metricas'

/**
 * Sparkline com área preenchida, um pouco mais presente que a de linha usada
 * hoje. Escala ao próprio min/max da série.
 */
export const SparklineDeArea = ({
  values,
  color,
  width = 120,
  height = 32,
  className = 'shrink-0'
}: {
  values: number[]
  color: string
  width?: number
  height?: number
  className?: string
}): JSX.Element | null => {
  // `useId` roda antes do early return para não violar a ordem dos hooks.
  const id = useId()

  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  const usableHeight = height - pad * 2
  const stepX = width / (values.length - 1)

  const pontos = values.map((v, i) => {
    const x = i * stepX
    const y = pad + usableHeight * (1 - (v - min) / range)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pontos.join(' ')} ${width},${height}`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <polyline
        points={pontos.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Variação percentual sem seta: o sinal (`+`/`−`) já dá a direção e a cor já
 * diz se é boa ou ruim. A seta era uma terceira codificação do mesmo fato.
 */
export const Variacao = ({
  comparacao,
  maiorEhMelhor,
  comRotulo = true,
  className = ''
}: {
  comparacao: KPIComparison
  maiorEhMelhor: boolean
  comRotulo?: boolean
  className?: string
}): JSX.Element => {
  return (
    <span
      className={`font-body-md whitespace-nowrap ${className}`}
      style={{ color: corDaVariacao(comparacao.percent, maiorEhMelhor) }}
      title={
        comparacao.perDay
          ? 'Calculado sobre a média diária — os períodos têm durações diferentes'
          : undefined
      }
    >
      <span className="font-bold">{percentual.format(comparacao.percent)}%</span>
      {comRotulo && (
        <span className="opacity-70">
          {' '}
          {comparacao.label}
          {comparacao.perDay ? ' · média/dia' : ''}
        </span>
      )}
    </span>
  )
}
