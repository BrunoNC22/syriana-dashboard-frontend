export type RankingOrdem = 'top' | 'bottom'

/** Recorta o ranking completo (ordenado DESC) para exibição no chart. */
export function recortarRanking<T>(data: T[], ordem: RankingOrdem, n = 10): T[] {
  return ordem === 'top' ? data.slice(0, n) : data.slice(-n).reverse()
}
