import { MetricaSerie } from '@renderer/kpis/useSeriesDiarias'

/**
 * As quatro métricas medidas do dashboard. A previsão fica de fora de
 * propósito: ela não responde ao período selecionado e tem contrato próprio
 * (método + erro), então não é intercambiável com estas.
 */
export type MetricaKpi = 'faturamento' | 'pedidos' | 'custo' | 'lucro'

export type DescritorMetrica = {
  titulo: string
  /** Rótulo curto, para layouts compactos onde o título completo não cabe. */
  tituloCurto: string
  icone: string
  endpoint: string
  chaveQuery: string
  serie: MetricaSerie
  formato: 'moeda' | 'inteiro'
  /** `false` quando cair é bom (custo) — inverte a cor da variação. */
  maiorEhMelhor: boolean
  mensagemVazio: string
}

export const METRICAS: Record<MetricaKpi, DescritorMetrica> = {
  faturamento: {
    titulo: 'Total vendido',
    tituloCurto: 'Vendido',
    icone: 'payments',
    endpoint: '/dashboard/total-vendido',
    chaveQuery: 'total-vendido',
    serie: 'faturamento',
    formato: 'moeda',
    maiorEhMelhor: true,
    mensagemVazio: 'Não há vendas neste período'
  },
  pedidos: {
    titulo: 'Quantidade de pedidos',
    tituloCurto: 'Pedidos',
    icone: 'receipt_long',
    endpoint: '/dashboard/quantidade-de-pedidos',
    chaveQuery: 'quantidade-de-pedidos',
    serie: 'pedidos',
    formato: 'inteiro',
    maiorEhMelhor: true,
    mensagemVazio: 'Não há pedidos neste período'
  },
  custo: {
    titulo: 'Custo total dos insumos',
    tituloCurto: 'Custo',
    icone: 'inventory_2',
    endpoint: '/dashboard/total-gasto-ingredientes',
    chaveQuery: 'total-gasto-ingredientes',
    serie: 'custo',
    formato: 'moeda',
    maiorEhMelhor: false,
    mensagemVazio: 'Não há custo de insumos neste período'
  },
  lucro: {
    titulo: 'Lucro total',
    tituloCurto: 'Lucro',
    icone: 'trending_up',
    endpoint: '/dashboard/lucro-total',
    chaveQuery: 'lucro-total',
    serie: 'lucro',
    formato: 'moeda',
    maiorEhMelhor: true,
    mensagemVazio: 'Não há lucro neste período'
  }
}

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2
})

/** Moeda sem centavos — para valores grandes onde os centavos são ruído. */
const moedaCurta = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
})

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export function formatarValor(
  valor: number,
  formato: DescritorMetrica['formato'],
  semCentavos = false
): string {
  if (formato === 'inteiro') return inteiro.format(valor)
  return semCentavos ? moedaCurta.format(valor) : moeda.format(valor)
}

export const percentual = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero'
})

export const CORES_TENDENCIA = {
  boa: '#4CAF50',
  ruim: '#F44336',
  neutra: '#9e9e9e'
} as const

/** Cor de uma variação, considerando se subir é bom para aquela métrica. */
export function corDaVariacao(percent: number, maiorEhMelhor: boolean): string {
  if (percent === 0) return CORES_TENDENCIA.neutra
  const subiu = percent > 0
  return (maiorEhMelhor ? subiu : !subiu) ? CORES_TENDENCIA.boa : CORES_TENDENCIA.ruim
}
