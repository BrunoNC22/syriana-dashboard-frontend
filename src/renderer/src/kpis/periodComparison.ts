import {
  differenceInCalendarDays,
  endOfMonth,
  endOfYear,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears
} from 'date-fns'
import { DateRange } from '@renderer/contexts/ApplicationDateContext'
import { hoje } from '@renderer/appClock'

/**
 * Modos explícitos de comparação entre períodos.
 *
 * - `periodo-anterior`: período imediatamente anterior de referência (comportamento
 *   automático histórico — dia/semana/mês/ano detectados a partir do intervalo).
 * - `ano-anterior`: mesmo período do ano anterior (dia/semana alinhados por dia da
 *   semana; mês/ano por calendário).
 * - `mes-anterior`: mesmo dia/intervalo no mês anterior (com clamp de fim de mês).
 * - `personalizado`: intervalo de comparação escolhido manualmente.
 * - `nenhum`: sem comparação.
 */
export type ComparisonMode =
  | 'periodo-anterior'
  | 'ano-anterior'
  | 'mes-anterior'
  | 'personalizado'
  | 'nenhum'

export type PeriodComparison = {
  /** Intervalo anterior contra o qual comparar o período selecionado. */
  previous: DateRange
  /** Rótulo legível do tipo de comparação (ex.: "em relação ao mês anterior"). */
  label: string
  /** Modo que gerou esta comparação. */
  mode: ComparisonMode
  /**
   * `true` quando o período anterior tem duração (em dias) diferente do atual.
   * Nesse caso, comparar apenas totais engana — a UI deve destacar a média/dia.
   */
  duracoesDiferentes: boolean
}

const WEEK_STARTS_ON = 0 // domingo (mesma convenção do DateRangePicker)
/** 52 semanas = 364 dias ≈ 1 ano, preservando o dia da semana (dom→dom, sáb→sáb). */
const SEMANAS_POR_ANO = 52

/** Duração do intervalo em dias (inclusiva). */
export function duracaoEmDias(range: DateRange): number {
  return differenceInCalendarDays(startOfDay(range.end), startOfDay(range.start)) + 1
}

function montar(
  range: DateRange,
  previous: DateRange,
  label: string,
  mode: ComparisonMode
): PeriodComparison {
  return {
    previous,
    label,
    mode,
    duracoesDiferentes: duracaoEmDias(range) !== duracaoEmDias(previous)
  }
}

/**
 * Deriva o período de comparação a partir do intervalo selecionado e do modo.
 *
 * Retorna `null` para o modo `'nenhum'` (e para `'personalizado'` sem `custom`).
 * O default `'periodo-anterior'` mantém o comportamento automático histórico, de
 * modo que `getComparisonPeriod(range)` continua equivalente à versão anterior.
 */
export function getComparisonPeriod(
  range: DateRange,
  mode: ComparisonMode = 'periodo-anterior',
  custom?: DateRange
): PeriodComparison | null {
  const start = startOfDay(range.start)
  const end = startOfDay(range.end)
  const today = startOfDay(hoje())
  const normalized: DateRange = { start, end }

  switch (mode) {
    case 'nenhum':
      return null
    case 'personalizado':
      if (!custom) return null
      return montar(
        normalized,
        { start: startOfDay(custom.start), end: startOfDay(custom.end) },
        'em relação ao período selecionado',
        'personalizado'
      )
    case 'ano-anterior':
      return comparacaoAnoAnterior(normalized, today)
    case 'mes-anterior':
      return comparacaoMesAnterior(normalized)
    case 'periodo-anterior':
    default:
      return comparacaoPeriodoAnterior(normalized, today)
  }
}

/**
 * Período imediatamente anterior de referência (comportamento automático).
 *
 * - Dia específico (start === end) → mesmo dia da semana anterior
 * - Semana (7 dias começando no domingo) → semana anterior
 * - Mês completo → mês anterior
 * - Ano corrente → ano anterior, de 1º de janeiro até a data equivalente a hoje
 * - Ano passado completo → ano anterior completo
 * - Qualquer outro intervalo → período imediatamente anterior de mesma duração
 */
function comparacaoPeriodoAnterior(range: DateRange, today: Date): PeriodComparison {
  const { start, end } = range

  // Dia específico
  if (isSameDay(start, end)) {
    return montar(
      range,
      { start: subWeeks(start, 1), end: subWeeks(end, 1) },
      'em relação ao mesmo dia da semana passada',
      'periodo-anterior'
    )
  }

  // Mês completo
  if (isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(start))) {
    const isCurrentMonth =
      start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth()
    if (isCurrentMonth) {
      // Mês corrente: compara do dia 1 até hoje contra o mesmo intervalo do mês anterior.
      const previousEnd = subMonths(today, 1)
      return montar(
        range,
        { start: startOfMonth(previousEnd), end: previousEnd },
        'em relação ao mês anterior (até hoje)',
        'periodo-anterior'
      )
    }
    const previousMonth = subMonths(start, 1)
    return montar(
      range,
      { start: startOfMonth(previousMonth), end: endOfMonth(previousMonth) },
      'em relação ao mês anterior',
      'periodo-anterior'
    )
  }

  // Ano completo
  if (isSameDay(start, startOfYear(start)) && isSameDay(end, endOfYear(start))) {
    const isCurrentYear = start.getFullYear() === today.getFullYear()
    if (isCurrentYear) {
      const previousEnd = subYears(today, 1)
      return montar(
        range,
        { start: startOfYear(previousEnd), end: previousEnd },
        'em relação ao ano anterior (até hoje)',
        'periodo-anterior'
      )
    }
    const previousYear = subYears(start, 1)
    return montar(
      range,
      { start: startOfYear(previousYear), end: endOfYear(previousYear) },
      'em relação ao ano anterior',
      'periodo-anterior'
    )
  }

  // Semana (7 dias começando no domingo)
  if (differenceInCalendarDays(end, start) === 6 && start.getDay() === WEEK_STARTS_ON) {
    const isCurrentWeek = today >= start && today <= end
    if (isCurrentWeek) {
      // Semana corrente: compara do início da semana até hoje contra o mesmo
      // intervalo da semana anterior.
      return montar(
        range,
        { start: subWeeks(start, 1), end: subWeeks(today, 1) },
        'em relação à semana anterior (até hoje)',
        'periodo-anterior'
      )
    }
    return montar(
      range,
      { start: subWeeks(start, 1), end: subWeeks(end, 1) },
      'em relação à semana anterior',
      'periodo-anterior'
    )
  }

  // Intervalo livre: período imediatamente anterior de mesma duração
  const lengthInDays = differenceInCalendarDays(end, start) + 1
  return montar(
    range,
    { start: subDays(start, lengthInDays), end: subDays(start, 1) },
    'em relação ao período anterior',
    'periodo-anterior'
  )
}

/**
 * Mesmo período do ano anterior.
 *
 * Dia e semana são alinhados por **dia da semana** (52 semanas atrás → mesmo
 * weekday ~1 ano antes), porque a sazonalidade semanal domina no restaurante
 * (sábado ≠ sexta). Mês e ano usam alinhamento de calendário; períodos parciais
 * correntes comparam "até o dia equivalente" no ano anterior.
 */
function comparacaoAnoAnterior(range: DateRange, today: Date): PeriodComparison {
  const { start, end } = range
  const anoAnterior = subYears(start, 1).getFullYear()

  // Dia específico → mesmo dia da semana ~1 ano antes
  if (isSameDay(start, end)) {
    const prev = subWeeks(start, SEMANAS_POR_ANO)
    return montar(
      range,
      { start: prev, end: prev },
      `em relação ao mesmo dia de ${anoAnterior}`,
      'ano-anterior'
    )
  }

  // Semana → mesma semana ~1 ano antes (dia da semana preservado)
  if (differenceInCalendarDays(end, start) === 6 && start.getDay() === WEEK_STARTS_ON) {
    return montar(
      range,
      { start: subWeeks(start, SEMANAS_POR_ANO), end: subWeeks(end, SEMANAS_POR_ANO) },
      `em relação à mesma semana de ${anoAnterior}`,
      'ano-anterior'
    )
  }

  // Mês completo → mesmo mês do ano anterior (calendário)
  if (isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(start))) {
    const isCurrentMonth =
      start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth()
    if (isCurrentMonth) {
      // Mês corrente parcial → do dia 1 até o dia equivalente a hoje no ano anterior.
      return montar(
        range,
        { start: startOfMonth(subYears(start, 1)), end: subYears(today, 1) },
        `em relação ao mesmo mês de ${anoAnterior} (até o dia equivalente)`,
        'ano-anterior'
      )
    }
    const prev = subYears(start, 1)
    return montar(
      range,
      { start: startOfMonth(prev), end: endOfMonth(prev) },
      `em relação ao mesmo mês de ${anoAnterior}`,
      'ano-anterior'
    )
  }

  // Ano completo → ano anterior (calendário)
  if (isSameDay(start, startOfYear(start)) && isSameDay(end, endOfYear(start))) {
    const isCurrentYear = start.getFullYear() === today.getFullYear()
    if (isCurrentYear) {
      const previousEnd = subYears(today, 1)
      return montar(
        range,
        { start: startOfYear(previousEnd), end: previousEnd },
        `em relação a ${anoAnterior} (até o dia equivalente)`,
        'ano-anterior'
      )
    }
    const prev = subYears(start, 1)
    return montar(
      range,
      { start: startOfYear(prev), end: endOfYear(prev) },
      `em relação a ${anoAnterior}`,
      'ano-anterior'
    )
  }

  // Intervalo livre → mesmo intervalo de calendário no ano anterior
  return montar(
    range,
    { start: subYears(start, 1), end: subYears(end, 1) },
    `em relação ao mesmo período de ${anoAnterior}`,
    'ano-anterior'
  )
}

/**
 * Mesmo dia/intervalo no mês anterior. Usa o clamp do date-fns (31/03 → 28 ou
 * 29/02) e sinaliza no rótulo quando o dia foi ajustado ao fim do mês.
 */
function comparacaoMesAnterior(range: DateRange): PeriodComparison {
  const { start, end } = range

  // Mês completo → mês anterior inteiro
  if (isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(start))) {
    const prev = subMonths(start, 1)
    return montar(
      range,
      { start: startOfMonth(prev), end: endOfMonth(prev) },
      'em relação ao mês anterior',
      'mes-anterior'
    )
  }

  // Dia ou intervalo livre → subtrai 1 mês com clamp de fim de mês
  const prevStart = subMonths(start, 1)
  const prevEnd = subMonths(end, 1)
  const houveClamp = prevStart.getDate() !== start.getDate() || prevEnd.getDate() !== end.getDate()
  let label = isSameDay(start, end)
    ? 'em relação ao mesmo dia do mês anterior'
    : 'em relação ao mesmo intervalo do mês anterior'
  if (houveClamp) label += ' (ajustado ao fim do mês)'
  return montar(range, { start: prevStart, end: prevEnd }, label, 'mes-anterior')
}
