/**
 * Paleta categórica para as etiquetas (categorias) de produto.
 * Matizes distintos que mantêm boa legibilidade sobre o fundo escuro do tema.
 * O mapeamento é determinístico: a mesma etiqueta recebe sempre a mesma cor.
 */
const palette = [
  '#E5C98B', // dourado (tema)
  '#6FCF97', // verde
  '#64B5F6', // azul
  '#E57373', // coral
  '#B39DDB', // lilás
  '#4DB6AC', // teal
  '#FFB74D', // laranja
  '#F06292', // rosa
  '#AED581', // lima
  '#4DD0E1', // ciano
  '#BA68C8', // roxo
  '#A1887F' // terroso
]

const SEM_CATEGORIA = '#9E9E9E'

export function etiquetaColor(nome: string | null | undefined): string {
  if (!nome) return SEM_CATEGORIA

  let hash = 0
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * 31 + nome.charCodeAt(i)) >>> 0
  }

  return palette[hash % palette.length]
}
