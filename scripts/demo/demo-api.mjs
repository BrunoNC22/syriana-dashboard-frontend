/**
 * API de DEMONSTRAÇÃO com dados 100% fictícios.
 *
 * Responde nos mesmos endpoints e com o mesmo formato JSON da API real
 * (apps/backend), mas sem banco de dados: os números são gerados de forma
 * determinística a partir da data, de um cardápio inventado e de uma equipe
 * inventada. Serve para mostrar o aplicativo (portfólio, apresentações,
 * capturas de tela) sem expor nenhum dado do restaurante.
 *
 * Uso: node scripts/demo/demo-api.mjs   (ou `npm run demo`, que também abre o app)
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.DEMO_API_PORT ?? 23984)

// ---------------------------------------------------------------------------
// Aleatoriedade determinística: o mesmo dia gera sempre os mesmos números.

function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Número em [0, 1) fixo para a chave informada. */
const rand = (key) => hash(key) / 4294967296

/** Ruído em [-amp, +amp] fixo para a chave informada. */
const noise = (key, amp) => (rand(key) * 2 - 1) * amp

const round = (n, casas = 2) => Math.round(n * 10 ** casas) / 10 ** casas

// ---------------------------------------------------------------------------
// Datas (sempre no fuso local, no formato ISO yyyy-mm-dd que a API real usa).

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const today = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(inicio, fim) {
  const dias = []
  for (let d = parseIso(inicio); d <= parseIso(fim); d = addDays(d, 1)) dias.push(d)
  return dias
}

// ---------------------------------------------------------------------------
// Cardápio, insumos e equipe fictícios.

const INSUMOS = [
  ['carne', 'Carne moída', 'kg', 42],
  ['frango', 'Peito de frango', 'kg', 24],
  ['farinha', 'Farinha de trigo', 'kg', 5.5],
  ['queijo', 'Queijo muçarela', 'kg', 38],
  ['grao', 'Grão-de-bico', 'kg', 11],
  ['tahine', 'Tahine', 'kg', 48],
  ['trigo', 'Trigo para kibe', 'kg', 9],
  ['berinjela', 'Berinjela', 'kg', 7],
  ['coalhada', 'Coalhada', 'L', 14],
  ['tomate', 'Tomate', 'kg', 8],
  ['salsinha', 'Salsinha (maço)', 'un', 2.5],
  ['batata', 'Batata', 'kg', 6],
  ['oleo', 'Óleo de soja', 'L', 8.5],
  ['pao', 'Pão sírio', 'un', 1.2],
  ['calabresa', 'Calabresa', 'kg', 29],
  ['zaatar', 'Zaatar', 'kg', 70],
  ['lentilha', 'Lentilha', 'kg', 12],
  ['arroz', 'Arroz', 'kg', 6],
  ['refri', 'Refrigerante lata', 'un', 3.2],
  ['laranja', 'Laranja', 'kg', 4.5],
  ['agua', 'Água mineral', 'un', 1.3],
  ['cerveja', 'Cerveja long neck', 'un', 5.8],
  ['filo', 'Massa filo', 'kg', 32],
  ['nozes', 'Nozes', 'kg', 85],
  ['leite', 'Leite', 'L', 5],
  ['hortela', 'Hortelã (maço)', 'un', 3],
].map(([key, nome, sigla, preco], i) => ({ key, id: String(2001 + i), nome, sigla, precoCusto: round(preco * 1.35) }))

const insumoByKey = Object.fromEntries(INSUMOS.map((i) => [i.key, i]))

// [nome, etiqueta, preço, peso de venda, receita { insumo: quantidade por unidade vendida }]
const PRODUTOS = [
  ['Esfiha de carne', 'Esfihas', 6.5, 10, { farinha: 0.05, carne: 0.04, tomate: 0.01, oleo: 0.005 }],
  ['Esfiha de queijo', 'Esfihas', 6.5, 8, { farinha: 0.05, queijo: 0.04, oleo: 0.005 }],
  ['Esfiha de frango', 'Esfihas', 6.5, 6, { farinha: 0.05, frango: 0.04, oleo: 0.005 }],
  ['Esfiha de zaatar', 'Esfihas', 6, 3, { farinha: 0.05, zaatar: 0.008, oleo: 0.01 }],
  ['Esfiha de calabresa', 'Esfihas', 6.5, 4, { farinha: 0.05, calabresa: 0.04, oleo: 0.005 }],
  ['Homus', 'Entradas', 28, 5, { grao: 0.18, tahine: 0.05, pao: 2 }],
  ['Babaganuch', 'Entradas', 29, 3, { berinjela: 0.35, tahine: 0.05, pao: 2 }],
  ['Coalhada seca', 'Entradas', 27, 3, { coalhada: 0.3, pao: 2 }],
  ['Tabule', 'Entradas', 26, 4, { trigo: 0.06, tomate: 0.15, salsinha: 1, hortela: 0.3 }],
  ['Kibe frito (6 un.)', 'Entradas', 32, 6, { trigo: 0.12, carne: 0.15, oleo: 0.05 }],
  ['Falafel (6 un.)', 'Entradas', 30, 4, { grao: 0.2, salsinha: 0.5, oleo: 0.05 }],
  ['Shawarma de frango', 'Pratos', 34, 7, { frango: 0.18, pao: 1, tomate: 0.04, tahine: 0.02 }],
  ['Shawarma de carne', 'Pratos', 38, 6, { carne: 0.18, pao: 1, tomate: 0.04, tahine: 0.02 }],
  ['Kafta no prato', 'Pratos', 52, 4, { carne: 0.25, arroz: 0.15, tomate: 0.05 }],
  ['Arroz com lentilha', 'Pratos', 39, 3, { arroz: 0.15, lentilha: 0.12, oleo: 0.02 }],
  ['Prato misto árabe', 'Pratos', 79, 3, { carne: 0.2, frango: 0.15, grao: 0.1, arroz: 0.15, pao: 2 }],
  ['Kibe assado', 'Pratos', 48, 2, { trigo: 0.15, carne: 0.25, oleo: 0.02 }],
  ['Batata frita', 'Porções', 29, 4, { batata: 0.45, oleo: 0.08 }],
  ['Pão sírio (porção)', 'Porções', 12, 5, { pao: 4 }],
  ['Refrigerante lata', 'Bebidas', 7, 12, { refri: 1 }],
  ['Suco natural', 'Bebidas', 12, 7, { laranja: 0.5 }],
  ['Água mineral', 'Bebidas', 5, 6, { agua: 1 }],
  ['Chá de hortelã', 'Bebidas', 9, 3, { hortela: 0.3 }],
  ['Cerveja long neck', 'Bebidas', 13, 6, { cerveja: 1 }],
  ['Baklava', 'Sobremesas', 14, 3, { filo: 0.04, nozes: 0.03 }],
  ['Malabie', 'Sobremesas', 16, 2, { leite: 0.2 }],
  ['Ataif', 'Sobremesas', 15, 1, { farinha: 0.05, nozes: 0.02, leite: 0.05 }],
].map(([nome, etiqueta, preco, peso, receita], i) => {
  const custoUnitario = Object.entries(receita).reduce((s, [k, q]) => s + q * insumoByKey[k].precoCusto, 0)
  return { id: String(101 + i), idProduto: 501 + i, nome, etiqueta, preco, peso, receita, custoUnitario }
})

const produtoById = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]))
const insumoById = Object.fromEntries(INSUMOS.map((i) => [i.id, i]))

const GARCONS = ['Rafael M.', 'Camila S.', 'Diego A.', 'Juliana P.', 'Marcos T.', 'Bianca L.', 'Thiago R.'].map(
  (nome, i) => ({ id: 11 + i, nome, peso: [1.3, 1.2, 1.05, 1, 0.9, 0.8, 0.6][i] })
)

// Datas comemorativas fictícias usadas pelas previsões (mesmas categorias da API real).
function datasEspeciais(ano) {
  const nthSunday = (mes, n) => {
    const d = new Date(ano, mes, 1)
    const offset = (7 - d.getDay()) % 7
    return new Date(ano, mes, 1 + offset + 7 * (n - 1))
  }
  return [
    { data: new Date(ano, 0, 1), nome: 'Confraternização Universal', categoria: 'NACIONAL' },
    { data: nthSunday(4, 2), nome: 'Dia das Mães', categoria: 'COMEMORATIVA' },
    { data: new Date(ano, 5, 12), nome: 'Dia dos Namorados', categoria: 'COMEMORATIVA' },
    { data: nthSunday(7, 2), nome: 'Dia dos Pais', categoria: 'COMEMORATIVA' },
    { data: new Date(ano, 10, 15), nome: 'Proclamação da República', categoria: 'NACIONAL' },
    { data: new Date(ano, 10, 20), nome: 'Dia da Consciência Negra', categoria: 'NACIONAL' },
    { data: new Date(ano, 11, 24), nome: 'Véspera de Natal', categoria: 'COMEMORATIVA' },
    { data: new Date(ano, 11, 25), nome: 'Natal', categoria: 'NACIONAL' },
    { data: new Date(ano, 11, 31), nome: 'Véspera de Ano-Novo', categoria: 'COMEMORATIVA' },
  ].map((f) => ({ data: iso(f.data), nome: f.nome, categoria: f.categoria }))
}

function feriadosEntre(inicio, fim) {
  const anos = new Set([parseIso(inicio).getFullYear(), parseIso(fim).getFullYear()])
  return [...anos].flatMap(datasEspeciais).filter((f) => f.data >= inicio && f.data <= fim)
}

// ---------------------------------------------------------------------------
// Movimento de cada dia.

// Domingo a sábado.
const FATOR_DIA_SEMANA = [1.25, 0.55, 0.7, 0.8, 0.92, 1.3, 1.45]
const FATOR_COMEMORATIVA = 1.6

const somaPesoPreco = PRODUTOS.reduce((s, p) => s + p.peso * p.preco, 0)

const cacheDia = new Map()

function dia(d) {
  const key = iso(d)
  if (cacheDia.has(key)) return cacheDia.get(key)

  const crescimento = 1 + (d - new Date(2025, 0, 1)) / (365 * 864e5) * 0.08
  const comemorativa = datasEspeciais(d.getFullYear()).some((f) => f.data === key && f.categoria === 'COMEMORATIVA')
  const faturamentoAlvo =
    6200 * FATOR_DIA_SEMANA[d.getDay()] * crescimento * (1 + noise(`fat:${key}`, 0.14)) * (comemorativa ? FATOR_COMEMORATIVA : 1)

  // Quantidades inteiras por produto, proporcionais ao peso de venda.
  const itens = PRODUTOS.map((p) => {
    const esperado = (faturamentoAlvo * p.peso) / somaPesoPreco
    return { produto: p, quantidade: Math.max(0, Math.round(esperado * (1 + noise(`qtd:${key}:${p.id}`, 0.25)))) }
  })

  const faturamento = itens.reduce((s, i) => s + i.quantidade * i.produto.preco, 0)
  const custo = itens.reduce((s, i) => s + i.quantidade * i.produto.custoUnitario, 0)
  const pedidos = Math.max(1, Math.round(faturamento / (82 + noise(`ticket:${key}`, 10))))

  const resultado = { dia: key, faturamento, custo, pedidos, itens }
  cacheDia.set(key, resultado)
  return resultado
}

/** Dias com movimento no intervalo (nada depois de hoje). */
function periodo(query) {
  const fim = query.get('dataFim') ?? iso(today())
  const inicio = query.get('dataInicio') ?? fim
  const limite = iso(today())
  return daysBetween(inicio, fim < limite ? fim : limite).map(dia)
}

function agregarProdutos(dias) {
  const mapa = new Map()
  for (const d of dias) {
    for (const { produto, quantidade } of d.itens) {
      mapa.set(produto.id, (mapa.get(produto.id) ?? 0) + quantidade)
    }
  }
  return PRODUTOS.map((p) => ({ produto: p, quantidade: mapa.get(p.id) ?? 0 }))
}

function agregarInsumos(dias) {
  const consumo = new Map(INSUMOS.map((i) => [i.key, { insumo: i, quantidade: 0, porProduto: new Map(), movimentacoes: 0 }]))
  for (const { produto, quantidade } of agregarProdutos(dias)) {
    for (const [k, q] of Object.entries(produto.receita)) {
      const c = consumo.get(k)
      c.quantidade += q * quantidade
      c.porProduto.set(produto.id, (c.porProduto.get(produto.id) ?? 0) + q * quantidade)
      c.movimentacoes += quantidade
    }
  }
  return [...consumo.values()].map((c) => ({ ...c, custo: c.quantidade * c.insumo.precoCusto }))
}

const somar = (dias, campo) => dias.reduce((s, d) => s + d[campo], 0)

// ---------------------------------------------------------------------------
// Previsões: média por dia da semana das últimas 8 semanas, com faixa de ±12%.

function parseHorizonte(texto) {
  const m = /^(\d+)([dsma]?)$/.exec(texto ?? '30d')
  if (!m) return 30
  const n = Number(m[1])
  return { '': n, d: n, s: n * 7, m: n * 30, a: n * 365 }[m[2]]
}

function prever(metrica, horizonteDias) {
  const hoje = today()
  const historico = daysBetween(iso(addDays(hoje, -56)), iso(addDays(hoje, -1))).map(dia)
  const valor = (d) => (metrica === 'pedidos' ? d.pedidos : d.faturamento)
  const mediaDia = [0, 1, 2, 3, 4, 5, 6].map((wd) => {
    const xs = historico.filter((d) => parseIso(d.dia).getDay() === wd).map(valor)
    return xs.reduce((a, b) => a + b, 0) / xs.length
  })
  const inicio = iso(addDays(hoje, 1))
  const fim = iso(addDays(hoje, horizonteDias))
  const feriados = feriadosEntre(inicio, fim)
  const pontos = daysBetween(inicio, fim).map((d) => {
    const feriado = feriados.find((f) => f.data === iso(d))
    const v = mediaDia[d.getDay()] * (feriado?.categoria === 'COMEMORATIVA' ? FATOR_COMEMORATIVA : 1)
    const largura = 0.1 + Math.min(0.12, ((d - hoje) / 864e5) * 0.002)
    return {
      data: iso(d),
      valor: round(v),
      limiteInferior: round(v * (1 - largura)),
      limiteSuperior: round(v * (1 + largura)),
      feriado: Boolean(feriado),
    }
  })
  return { pontos, feriados, diasHistorico: 540, mape: metrica === 'pedidos' ? 9.4 : 11.2 }
}

// ---------------------------------------------------------------------------
// Rotas: mesmos caminhos e formatos da API real.

const routes = {
  '/': () => ({ status: 'demo' }),
  '/metadata': () => [],

  '/dashboard/total-vendido': (q) => round(somar(periodo(q), 'faturamento')),
  '/dashboard/quantidade-de-pedidos': (q) => somar(periodo(q), 'pedidos'),
  '/dashboard/total-gasto-ingredientes': (q) => round(somar(periodo(q), 'custo')),
  '/dashboard/lucro-total': (q) => {
    const dias = periodo(q)
    return round(somar(dias, 'faturamento') - somar(dias, 'custo'))
  },

  '/dashboard/faturamento-por-dia': (q) => periodo(q).map((d) => ({ dia: d.dia, faturamento: round(d.faturamento) })),

  '/dashboard/series-diarias': (q) =>
    periodo(q).map((d) => ({
      dia: d.dia,
      faturamento: round(d.faturamento),
      pedidos: d.pedidos,
      custo: round(d.custo),
      lucro: round(d.faturamento - d.custo),
    })),

  '/dashboard/produtos-mais-vendidos': (q) =>
    agregarProdutos(periodo(q))
      .filter((p) => p.quantidade > 0)
      .sort((a, b) => b.quantidade - a.quantidade)
      .map(({ produto, quantidade }) => ({ id: produto.id, nomeProduto: produto.nome, totalVendido: quantidade })),

  '/dashboard/faturamento-por-produto': (q) =>
    agregarProdutos(periodo(q))
      .map(({ produto, quantidade }) => ({ id: produto.id, nome: produto.nome, faturamento: round(quantidade * produto.preco) }))
      .filter((p) => p.faturamento > 0)
      .sort((a, b) => b.faturamento - a.faturamento),

  '/dashboard/horario-de-pico': (q) => {
    const diaSemana = Number(q.get('diaSemana') ?? 5)
    const dias = periodo(q).filter((d) => parseIso(d.dia).getDay() === diaSemana)
    const media = dias.length ? somar(dias, 'faturamento') / dias.length : 0
    // Almoço (11h–15h) e jantar (18h–23h).
    const perfil = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 1, 0.9, 0.5, 0.15, 0.1, 0.2, 0.6, 1.1, 1.3, 1, 0.6, 0.25]
    const total = perfil.reduce((a, b) => a + b, 0)
    return perfil.map((p, h) => ({
      hora: `${String(h).padStart(2, '0')}:00`,
      mediaFaturamento: round((media * p) / total * (1 + noise(`hora:${diaSemana}:${h}`, 0.08))),
    }))
  },

  '/dashboard/produto-detalhes': (q) => {
    const produto = produtoById[q.get('id')] ?? PRODUTOS[0]
    const quantidade = agregarProdutos(periodo(q)).find((p) => p.produto.id === produto.id).quantidade
    const faturamento = quantidade * produto.preco
    const custoTotal = quantidade * produto.custoUnitario
    return {
      nomeProduto: produto.nome,
      quantidadeVendida: quantidade,
      faturamento: round(faturamento),
      custoTotal: round(custoTotal),
      lucro: round(faturamento - custoTotal),
      margemLucro: faturamento > 0 ? round(((faturamento - custoTotal) / faturamento) * 100) : 0,
      insumos: Object.entries(produto.receita).map(([k, qtd]) => ({
        nome: insumoByKey[k].nome,
        siglaUnidadeDeMedida: insumoByKey[k].sigla,
        quantidadeTotal: round(qtd * quantidade, 3),
        custoTotal: round(qtd * quantidade * insumoByKey[k].precoCusto),
      })),
    }
  },

  '/dashboard/insumos-que-mais-custaram': (q) =>
    agregarInsumos(periodo(q))
      .filter((c) => c.custo > 0)
      .sort((a, b) => b.custo - a.custo)
      .map((c) => ({
        id: c.insumo.id,
        nome: c.insumo.nome,
        siglaUnidadeDeMedida: c.insumo.sigla,
        quantidade: round(c.quantidade, 3),
        precoPorUnidadeDeMedida: c.insumo.precoCusto,
        valorTotal: round(c.custo),
      })),

  '/dashboard/insumo-detalhes': (q) => {
    const alvo = insumoById[q.get('id')] ?? INSUMOS[0]
    const c = agregarInsumos(periodo(q)).find((x) => x.insumo.id === alvo.id)
    return {
      nome: alvo.nome,
      siglaUnidadeDeMedida: alvo.sigla,
      quantidadeTotal: round(c.quantidade, 3),
      custoTotal: round(c.custo),
      custoMedioPorUnidade: alvo.precoCusto,
      produtosDistintos: c.porProduto.size,
      movimentacoes: c.movimentacoes,
      produtos: [...c.porProduto.entries()]
        .map(([id, qtd]) => ({
          id,
          nomeProduto: produtoById[id].nome,
          quantidadeUsada: round(qtd, 3),
          custoTotal: round(qtd * alvo.precoCusto),
        }))
        .sort((a, b) => b.custoTotal - a.custoTotal),
    }
  },

  '/garcons': (q) => ranking(periodo(q)),

  '/produtos': () => [
    ...PRODUTOS.map((p) => ({ id: p.id, idProduto: p.idProduto, nome: p.nome, etiqueta: p.etiqueta, tipo: 1 })),
    ...INSUMOS.map((i, n) => ({ id: i.id, idProduto: 801 + n, nome: i.nome, etiqueta: null, tipo: 2 })),
  ],

  '/analytics/previsao': (q) => {
    const metrica = q.get('metrica') ?? 'faturamento'
    const horizonte = parseHorizonte(q.get('horizonte'))
    const p = prever(metrica, horizonte)
    return {
      metrica,
      metodo: 'HOLT_WINTERS',
      mape: p.mape,
      horizonteDias: horizonte,
      diasHistorico: p.diasHistorico,
      avisoBaixaConfianca: horizonte > 90 ? 'Horizonte longo (> 90 dias): a incerteza cresce com a distância.' : null,
      pontos: p.pontos,
      feriadosNoHorizonte: p.feriados,
    }
  },

  '/analytics/produtos-baixo-desempenho': () => {
    const hoje = today()
    const p = (nome) => PRODUTOS.find((x) => x.nome === nome)
    return {
      semVendas: [
        { id: p('Ataif').id, nome: 'Ataif', etiqueta: 'Sobremesas', ultimaVenda: iso(addDays(hoje, -41)), novo: false },
        { id: '190', nome: 'Esfiha de espinafre', etiqueta: 'Esfihas', ultimaVenda: null, novo: true },
      ],
      maioresQuedas: [
        { id: p('Kibe assado').id, nome: 'Kibe assado', etiqueta: 'Pratos', quantidadeAtual: 18, quantidadeAnterior: 31, variacaoPercentual: -41.9 },
        { id: p('Malabie').id, nome: 'Malabie', etiqueta: 'Sobremesas', quantidadeAtual: 22, quantidadeAnterior: 34, variacaoPercentual: -35.3 },
        { id: p('Chá de hortelã').id, nome: 'Chá de hortelã', etiqueta: 'Bebidas', quantidadeAtual: 40, quantidadeAnterior: 55, variacaoPercentual: -27.3 },
      ],
      tendenciaQueda: [
        { id: p('Arroz com lentilha').id, nome: 'Arroz com lentilha', etiqueta: 'Pratos', slopePorSemana: -1.8, quantidadeTotal: 96, semanas: 8 },
        { id: p('Coalhada seca').id, nome: 'Coalhada seca', etiqueta: 'Entradas', slopePorSemana: -1.1, quantidadeTotal: 104, semanas: 8 },
      ],
      abandonados: [
        { id: '191', nome: 'Charuto de folha de uva', etiqueta: 'Pratos', ultimaVenda: iso(addDays(hoje, -150)), mesesComVenda: 7, quantidadeUltimos6Meses: 4 },
      ],
    }
  },

  '/analytics/insumos-baixo-uso': () => {
    const hoje = today()
    const i = (key) => insumoByKey[key]
    return {
      poucoUtilizados: [
        { id: i('zaatar').id, nome: i('zaatar').nome, sigla: 'kg', quantidadeConsumida: 0.9, custoConsumido: 63, ultimoUso: iso(addDays(hoje, -2)), novo: false },
        { id: i('nozes').id, nome: i('nozes').nome, sigla: 'kg', quantidadeConsumida: 1.4, custoConsumido: 119, ultimoUso: iso(addDays(hoje, -1)), novo: false },
      ],
      capitalParado: [
        { id: i('tahine').id, nome: i('tahine').nome, sigla: 'kg', estoqueAtual: 14, custoEstoqueParado: 672, ultimoUso: iso(addDays(hoje, -1)) },
        { id: i('filo').id, nome: i('filo').nome, sigla: 'kg', estoqueAtual: 9, custoEstoqueParado: 288, ultimoUso: iso(addDays(hoje, -3)) },
      ],
      quedaConsumo: [
        { id: i('lentilha').id, nome: i('lentilha').nome, sigla: 'kg', quantidadeAtual: 3.1, quantidadeAnterior: 5.2, variacaoPercentual: -40.4 },
      ],
      foraDoPadrao: [
        { id: i('batata').id, nome: i('batata').nome, sigla: 'kg', consumoUltimaSemana: 71, mediaSemanal: 48, desvioPadrao: 7.5, zScore: 3.07 },
      ],
    }
  },

  '/relatorios/previsao-compras': (q) => {
    const horizonte = parseHorizonte(q.get('horizonte'))
    const hoje = today()
    const inicio = addDays(hoje, 1)
    const fim = addDays(hoje, horizonte)
    const fat = prever('faturamento', horizonte)
    const ped = prever('pedidos', horizonte)
    const total = (p, campo) => round(p.pontos.reduce((s, x) => s + x[campo], 0))
    const ultimos28 = daysBetween(iso(addDays(hoje, -28)), iso(addDays(hoje, -1))).map(dia)
    const consumo = agregarInsumos(ultimos28)
    const compras = consumo
      .filter((c) => c.quantidade > 0)
      .map((c) => {
        const diario = c.quantidade / 28
        const previsto = diario * horizonte
        const estoque = round(diario * (3 + rand(`est:${c.insumo.key}`) * 20), 2)
        const seguranca = round(diario * 3, 3)
        const comprar = Math.max(0, round(previsto + seguranca - estoque, 2))
        const cobertura = round(estoque / diario, 1)
        const risco = cobertura < 5 ? 'alto' : cobertura < 10 ? 'medio' : 'baixo'
        return {
          id: c.insumo.id,
          nome: c.insumo.nome,
          siglaUnidadeDeMedida: c.insumo.sigla,
          consumoPrevisto: round(previsto, 2),
          custoPrevisto: round(previsto * c.insumo.precoCusto),
          estoqueAtual: estoque,
          estoqueConfiavel: rand(`conf:${c.insumo.key}`) > 0.15,
          estoqueSeguranca: seguranca,
          margemSeguranca: ['baixa', 'normal', 'alta'][Math.floor(rand(`marg:${c.insumo.key}`) * 3)],
          compraRecomendada: comprar,
          custoCompraRecomendada: round(comprar * c.insumo.precoCusto),
          riscoRuptura: risco,
          diasCobertura: cobertura,
          excesso: cobertura > horizonte * 1.5,
          justificativa: `Consumo médio de ${round(diario, 2)} ${c.insumo.sigla}/dia nos últimos 28 dias; estoque cobre ${cobertura} dias.`,
        }
      })
      .sort((a, b) => b.custoCompraRecomendada - a.custoCompraRecomendada)
    return {
      geradoEm: iso(hoje),
      horizonteInicio: iso(inicio),
      horizonteFim: iso(fim),
      horizonteDias: horizonte,
      baseHistorica: 'Consumo dos últimos 28 dias; previsão de custo treinada em 540 dias de histórico. Método: HOLT_WINTERS (MAPE 11.2%).',
      panorama: {
        faturamento: { total: total(fat, 'valor'), limiteInferior: total(fat, 'limiteInferior'), limiteSuperior: total(fat, 'limiteSuperior'), metodo: 'HOLT_WINTERS', mape: fat.mape },
        pedidos: { total: total(ped, 'valor'), limiteInferior: total(ped, 'limiteInferior'), limiteSuperior: total(ped, 'limiteSuperior'), metodo: 'HOLT_WINTERS', mape: ped.mape },
        datasEspeciais: fat.feriados,
      },
      compras,
      avisos: [
        'DEMONSTRAÇÃO: todos os números desta tela são fictícios.',
        'Custos estimados pelo preço de custo atual — o sistema legado não registra o valor de compra.',
      ],
    }
  },
}

function ranking(dias) {
  const fat = somar(dias, 'faturamento')
  const custo = somar(dias, 'custo')
  const comandas = somar(dias, 'pedidos')
  const pesoTotal = GARCONS.reduce((s, g) => s + g.peso, 0)
  return GARCONS.map((g) => {
    const share = (g.peso / pesoTotal) * (1 + noise(`garcom:${g.id}:${dias[0]?.dia}`, 0.06))
    const f = fat * share
    return {
      id: g.id,
      nome: g.nome,
      totalTaxaServico: round(f * 0.1),
      faturamento: round(f),
      custo: round(custo * share),
      lucro: round(f - custo * share),
      comandas: Math.round(comandas * share),
      itensLancados: Math.round(comandas * share * 3.4),
    }
  }).sort((a, b) => b.totalTaxaServico - a.totalTaxaServico)
}

function garcomDetalhes(id, query) {
  const dias = periodo(query)
  const resumo = ranking(dias).find((g) => g.id === id) ?? ranking(dias)[0]
  const g = GARCONS.find((x) => x.id === resumo.id)
  const pesoTotal = GARCONS.reduce((s, x) => s + x.peso, 0)
  const produtosMaisVendidos = agregarProdutos(dias)
    .map(({ produto, quantidade }) => ({
      nomeProduto: produto.nome,
      etiqueta: produto.etiqueta,
      quantidade: Math.round((quantidade * g.peso) / pesoTotal * (1 + noise(`gp:${g.id}:${produto.id}`, 0.3))),
    }))
    .filter((p) => p.quantidade > 0)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)
  return { ...resumo, produtosMaisVendidos }
}

// ---------------------------------------------------------------------------

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const path = url.pathname.replace(/\/$/, '') || '/'

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const garcom = /^\/garcons\/(\d+)$/.exec(path)
    const handler = garcom ? () => garcomDetalhes(Number(garcom[1]), url.searchParams) : routes[path]
    if (!handler) {
      res.statusCode = 404
      res.end(JSON.stringify({ mensagem: `Rota não existe na API de demonstração: ${path}` }))
      return
    }
    res.end(JSON.stringify(handler(url.searchParams)))
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ mensagem: String(err) }))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API de demonstração (dados fictícios) em http://127.0.0.1:${PORT}`)
})
