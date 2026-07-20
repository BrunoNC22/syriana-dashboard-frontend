/** Espelho dos DTOs de `/relatorios/previsao-compras` (F5-02). */

export type ValorPrevisto = {
  total: number
  limiteInferior: number
  limiteSuperior: number
  metodo: string
  mape: number | null
}

export type Feriado = { data: string; nome: string; categoria: string }

export type Panorama = {
  faturamento: ValorPrevisto
  pedidos: ValorPrevisto
  datasEspeciais: Feriado[]
}

export type LinhaCompra = {
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

export type RelatorioCompras = {
  geradoEm: string
  horizonteInicio: string
  horizonteFim: string
  horizonteDias: number
  baseHistorica: string
  panorama: Panorama
  compras: LinhaCompra[]
  avisos: string[]
}

/** Prioridade do semáforo de ruptura (maior = mais urgente). */
export const PRIORIDADE_RISCO: Record<string, number> = { alto: 3, medio: 2, baixo: 1 }
