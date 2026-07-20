import { LinhaCompra, PRIORIDADE_RISCO, RelatorioCompras } from './types'

/**
 * CSV da tabela de compras no dialeto que o Excel pt-BR entende:
 * separador `;` e decimal com vírgula (o BOM UTF-8 é adicionado no main).
 */

const SEPARADOR = ';'
const QUEBRA = '\r\n'

/** Envolve em aspas só quando o campo contém separador, aspas ou quebra de linha. */
const campo = (valor: string): string =>
  /[";\r\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor

const numero = (n: number, casas: number): string =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

const ROTULO_RISCO: Record<string, string> = {
  alto: 'Alto',
  medio: 'Médio',
  baixo: 'Baixo'
}

const CABECALHO = [
  'Insumo',
  'Unidade',
  'Consumo previsto',
  'Estoque atual',
  'Estoque confiável',
  'Estoque de segurança',
  'Margem de segurança',
  'Compra recomendada',
  'Custo estimado (R$)',
  'Dias de cobertura',
  'Risco de ruptura',
  'Excesso',
  'Justificativa'
]

const linhaCsv = (l: LinhaCompra): string =>
  [
    l.nome,
    l.siglaUnidadeDeMedida,
    numero(l.consumoPrevisto, 3),
    // Saldo não confiável não vira 0 no CSV: exportar 0 seria afirmar algo falso.
    l.estoqueConfiavel ? numero(l.estoqueAtual ?? 0, 3) : '',
    l.estoqueConfiavel ? 'sim' : 'não',
    numero(l.estoqueSeguranca, 3),
    l.margemSeguranca,
    numero(l.compraRecomendada, 3),
    numero(l.custoCompraRecomendada, 2),
    l.diasCobertura == null ? '' : numero(l.diasCobertura, 1),
    ROTULO_RISCO[l.riscoRuptura] ?? l.riscoRuptura,
    l.excesso ? 'capital parado' : '',
    l.justificativa
  ]
    .map(campo)
    .join(SEPARADOR)

/**
 * Ordena por urgência (risco, depois volume de compra) para o CSV ser útil
 * independente da ordenação escolhida na tela.
 */
const porUrgencia = (a: LinhaCompra, b: LinhaCompra): number => {
  const risco = (PRIORIDADE_RISCO[b.riscoRuptura] ?? 0) - (PRIORIDADE_RISCO[a.riscoRuptura] ?? 0)
  return risco !== 0 ? risco : b.compraRecomendada - a.compraRecomendada
}

export const gerarCsvCompras = (linhas: LinhaCompra[]): string =>
  [CABECALHO.map(campo).join(SEPARADOR), ...[...linhas].sort(porUrgencia).map(linhaCsv)].join(
    QUEBRA
  )

export const nomeArquivoRelatorio = (data: RelatorioCompras, extensao: string): string =>
  `relatorio-compras_${data.horizonteInicio}_a_${data.horizonteFim}.${extensao}`
