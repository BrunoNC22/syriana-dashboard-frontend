export type TrendDirection = 'up' | 'flat' | 'down'

/**
 * Slope de regressão linear (mínimos quadrados) de `values` sobre o índice
 * 0..n-1. Positivo = série subindo ao longo do tempo. Retorna 0 para <2 pontos.
 */
export function linearSlope(values: number[]): number {
  const n = values.length
  if (n < 2) return 0

  const meanX = (n - 1) / 2
  const meanY = values.reduce((sum, v) => sum + v, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY)
    den += (i - meanX) ** 2
  }

  return den === 0 ? 0 : num / den
}

/**
 * Direção da tendência. Normaliza o slope pela média absoluta da série (vira um
 * percentual por dia); variações abaixo de ~1%/dia são consideradas estáveis
 * para não transformar ruído em seta.
 */
export function trendDirection(values: number[]): TrendDirection {
  if (values.length < 2) return 'flat'

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  if (mean === 0) return 'flat'

  const slopePorDia = linearSlope(values) / Math.abs(mean)

  if (slopePorDia > 0.01) return 'up'
  if (slopePorDia < -0.01) return 'down'
  return 'flat'
}
