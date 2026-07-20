import { useMemo, useState } from 'react'

export const TAMANHOS_PAGINA = [10, 20, 30, 50]

export const TAMANHO_PAGINA_PADRAO = 10

export type Paginacao = {
  pagina: number
  tamanho: number
  total: number
  totalPaginas: number
  /** Índice global do primeiro item da página. */
  inicio: number
  /** Índice global logo após o último item da página (exclusivo). */
  fim: number
  setTamanho: (n: number) => void
  irPara: (p: number) => void
  /** Classe a aplicar no `<tr>`, dado o índice global da linha. */
  classeDaLinha: (indice: number) => string
}

/**
 * Paginação client-side das tabelas — os endpoints de ranking já devolvem
 * tudo de uma vez (Convenção 10), então não há o que paginar no servidor.
 *
 * <p><b>As linhas fora da página continuam no DOM.</b> Elas recebem
 * `hidden print:table-row`: somem da tela, mas voltam na mídia de impressão.
 * É o que mantém o PDF do relatório de compras completo sem acoplar
 * exportação e paginação — se a paginação recortasse o array, o PDF sairia
 * com 10 linhas e ninguém notaria até o relatório chegar ao cliente. O custo
 * é nulo: é exatamente o número de linhas que já era renderizado antes.
 */
export function usePaginacao(total: number, tamanhoInicial = TAMANHO_PAGINA_PADRAO): Paginacao {
  const [tamanho, setTamanhoState] = useState(tamanhoInicial)
  const [pagina, setPagina] = useState(1)

  return useMemo(() => {
    const totalPaginas = Math.max(1, Math.ceil(total / tamanho))

    // Clamp derivado em vez de reset por efeito: quando um filtro encolhe a
    // lista, a página atual pode deixar de existir. Corrigir no render evita
    // o flash de "página vazia" que um useEffect mostraria antes de corrigir.
    const atual = Math.min(pagina, totalPaginas)

    const inicio = (atual - 1) * tamanho
    const fim = Math.min(inicio + tamanho, total)

    return {
      pagina: atual,
      tamanho,
      total,
      totalPaginas,
      inicio,
      fim,
      setTamanho: (n: number): void => {
        setTamanhoState(n)
        setPagina(1)
      },
      irPara: (p: number): void => setPagina(Math.min(Math.max(1, p), totalPaginas)),
      classeDaLinha: (i: number): string => (i >= inicio && i < fim ? '' : 'hidden print:table-row')
    }
  }, [total, tamanho, pagina])
}
