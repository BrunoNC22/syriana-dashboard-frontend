type SparklineProps = {
  values: number[]
  color?: string
  width?: number
  height?: number
}

/**
 * Sparkline minimalista em SVG (polyline). Leve de propósito — evita instanciar
 * um Chart.js por card. Escala os valores ao próprio min/max, com uma pequena
 * margem vertical para a linha não encostar nas bordas.
 */
export const Sparkline = ({
  values,
  color = 'currentColor',
  width = 120,
  height = 28
}: SparklineProps): React.JSX.Element | null => {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  const usableHeight = height - pad * 2
  const stepX = width / (values.length - 1)

  const points = values
    .map((v, i) => {
      const x = i * stepX
      const y = pad + usableHeight * (1 - (v - min) / range)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
