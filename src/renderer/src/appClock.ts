import { format, isValid, parseISO, startOfDay } from 'date-fns'

/**
 * Relógio de negócio do renderer — a fonte de "que dia é hoje" para períodos,
 * comparações e previsões.
 *
 * Em desenvolvimento o banco tem dados só até certa data; o campo
 * `dataAtualSimulada` do `server-config.json` faz a aplicação acreditar que
 * hoje é aquele dia. O main process resolve o valor (e o ignora quando o app
 * está empacotado) e o entrega no boot via `window.api.getDataAtual()`.
 *
 * **São dois relógios.** Este é o de negócio. Timestamp de log continua usando
 * `new Date()` direto — data falsa em log é inútil para investigar incidente.
 */

let dataSimulada: Date | null = null

/**
 * Define o relógio. Chamado uma única vez em `main.tsx`, antes do primeiro
 * render — nenhum módulo calcula data em escopo de módulo, então todo consumo
 * de `hoje()` acontece depois disto.
 *
 * @param iso data no formato `yyyy-MM-dd`, ou `null` para usar o relógio real.
 */
export function configurarRelogio(iso: string | null): void {
  if (!iso) {
    dataSimulada = null
    return
  }

  const parsed = parseISO(iso)

  if (!isValid(parsed)) {
    console.warn(`[appClock] data simulada inválida: "${iso}". Usando o relógio do sistema.`)
    dataSimulada = null
    return
  }

  dataSimulada = startOfDay(parsed)
}

/** `true` quando a aplicação está rodando com data simulada. */
export function isDataSimulada(): boolean {
  return dataSimulada !== null
}

/**
 * "Hoje" para efeito de dados. Sem simulação devolve o instante real —
 * comportamento idêntico ao `new Date()` que este helper substituiu.
 * Sempre uma instância nova, para ninguém mutar o estado do módulo.
 */
export function hoje(): Date {
  return dataSimulada ? new Date(dataSimulada) : new Date()
}

/** Atalho para o formato que a API espera nas query strings. */
export function hojeISO(): string {
  return format(hoje(), 'yyyy-MM-dd')
}
