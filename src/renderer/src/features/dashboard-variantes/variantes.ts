/**
 * Registro das variantes de dashboard em avaliação.
 *
 * É uma bancada de comparação temporária: a variante 1 é o dashboard atual
 * (referência), as demais testam decisões diferentes de apresentação dos KPIs.
 * Todas compartilham dados (`useKpi`) e a área de gráficos, para que a única
 * diferença entre elas seja a faixa de KPIs. Quando uma for escolhida, as
 * outras saem junto com esta pasta.
 */
export type Variante = {
  rota: string
  /** Rótulo na sidebar. */
  rotulo: string
  /** Uma linha resumindo a decisão — aparece sob o rótulo na sidebar. */
  resumo: string
  /** Título da tela. */
  titulo: string
  /** Decisões tomadas, listadas no cabeçalho da variante. */
  decisoes: string[]
}

export const VARIANTES: Variante[] = [
  {
    rota: '/',
    rotulo: 'Dashboard 1',
    resumo: 'Atual — referência',
    titulo: 'Dashboard 1 · Atual (referência)',
    decisoes: [
      'Nenhuma mudança: é o dashboard como está hoje, para servir de base de comparação',
      'Cada card empilha valor, até duas linhas de comparação e sparkline com seta e rótulo "30d"',
      'Cinco KPIs numa grade de quatro colunas — o quinto fica órfão na segunda linha'
    ]
  },
  {
    rota: '/dashboard-2',
    rotulo: 'Dashboard 2',
    resumo: 'Enxuto + hover',
    titulo: 'Dashboard 2 · Enxuto com detalhe no hover',
    decisoes: [
      'Uma comparação só no card: a do modo selecionado no "Comparar com". A comparação anual deixa de ser fixa e passa a aparecer apenas quando você escolhe "ano anterior" — fora disso ela vive no hover',
      'Sparkline e variação percentual fundidos numa linha só, sem seta: a cor e o sinal já indicam a direção, e a própria sparkline mostra o formato',
      'Passar o mouse revela o detalhe no próprio card — valor do período comparado, comparação anual e a faixa dos últimos 30 dias',
      'A previsão continua na faixa, como no atual'
    ]
  },
  {
    rota: '/dashboard-3',
    rotulo: 'Dashboard 3',
    resumo: 'Destaque + modal',
    titulo: 'Dashboard 3 · Métrica em destaque e detalhe em modal',
    decisoes: [
      'Total vendido vira o card principal, ocupando o dobro do espaço, com a série de 30 dias desenhada como área',
      'Pedidos, custo e lucro ficam compactos ao lado: valor e uma variação, sem sparkline',
      'Clicar em qualquer card abre um modal com o detalhe completo — comparações, faixa dos 30 dias, melhor e pior dia',
      'A previsão sai da faixa de KPIs e ganha uma tira própria: ela não responde ao período selecionado, então não pertence a uma faixa cujo contrato é "tudo aqui é o período escolhido"',
      'Com quatro cards medidos, a grade fecha certo'
    ]
  },
  {
    rota: '/dashboard-4',
    rotulo: 'Dashboard 4',
    resumo: 'Resultado unificado',
    titulo: 'Dashboard 4 · Resultado financeiro unificado',
    decisoes: [
      'Faturamento, custo e lucro deixam de ser três cards e viram um só, com barras proporcionais mostrando quanto do faturamento virou custo e quanto sobrou',
      'A margem de lucro aparece em destaque — hoje ela não existe em lugar nenhum e o gerente precisa calcular de cabeça',
      'Pedidos e ticket médio ficam num card de operação; o ticket médio é derivado dos números que já temos',
      'Detalhe em modal, como na variante 3',
      'É o maior salto conceitual: ganha a relação entre os números, perde o valor de cada um como manchete isolada'
    ]
  }
]
