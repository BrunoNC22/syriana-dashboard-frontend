/** Item do catálogo retornado por GET /produtos. */
export type ProdutoCatalogo = {
  /** PRODUTODETALHE.CODIGO — usado em /product-details/:id */
  id: string
  /** PRODUTOS.CODIGO — usado em /insumo-details/:id quando tipo = 2 */
  idProduto: number
  nome: string
  etiqueta: string | null
  /** PRODUTOTIPO.CODIGO (1=Produto, 2=Insumo, 3=Complemento, 4=Combo, 5=Por Tamanho) */
  tipo: number
}

export const TIPO_INSUMO = 2

/** Normaliza para comparação: minúsculas, sem acentos, sem espaços nas pontas. */
export const normalizar = (s: string): string =>
  s
    .normalize('NFD')
    // remove os diacríticos (combining marks) separados pelo NFD
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/**
 * Pontua o match de um nome contra o termo. Menor = melhor; null = não bate.
 * Ordem: igual < começa com < palavra começa com < contém.
 */
const pontuar = (nomeNormalizado: string, termo: string): number | null => {
  if (nomeNormalizado === termo) return 0
  if (nomeNormalizado.startsWith(termo)) return 1
  if (nomeNormalizado.split(/\s+/).some((palavra) => palavra.startsWith(termo))) return 2
  if (nomeNormalizado.includes(termo)) return 3
  return null
}

/** Filtra e ordena o catálogo pelo termo digitado (case/acento-insensível). */
export function buscarProdutos(
  catalogo: ProdutoCatalogo[],
  termo: string,
  limite = 8
): ProdutoCatalogo[] {
  const termoNormalizado = normalizar(termo)
  if (!termoNormalizado) return []

  return catalogo
    .map((produto) => ({ produto, score: pontuar(normalizar(produto.nome), termoNormalizado) }))
    .filter((item): item is { produto: ProdutoCatalogo; score: number } => item.score !== null)
    .sort((a, b) => a.score - b.score || a.produto.nome.localeCompare(b.produto.nome, 'pt-BR'))
    .slice(0, limite)
    .map((item) => item.produto)
}
