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

export type PeriodComparison = {
  /** Intervalo anterior contra o qual comparar o período selecionado. */
  previous: DateRange
  /** Rótulo legível do tipo de comparação (ex.: "em relação ao mês anterior"). */
  label: string
}

const WEEK_STARTS_ON = 0 // domingo (mesma convenção do DateRangePicker)

/**
 * Deriva o período anterior de referência a partir do intervalo selecionado.
 *
 * - Dia específico (start === end) → mesmo dia da semana anterior
 * - Semana (7 dias começando no domingo) → semana anterior
 * - Mês completo → mês anterior
 * - Ano corrente → ano anterior, de 1º de janeiro até a data equivalente a hoje
 * - Ano passado completo → ano anterior completo
 * - Qualquer outro intervalo → período imediatamente anterior de mesma duração
 */
export function getComparisonPeriod(range: DateRange): PeriodComparison {
  const start = startOfDay(range.start)
  const end = startOfDay(range.end)
  const today = startOfDay(new Date())

  // Dia específico
  if (isSameDay(start, end)) {
    return {
      previous: { start: subWeeks(start, 1), end: subWeeks(end, 1) },
      label: 'em relação ao mesmo dia da semana passada'
    }
  }

  // Mês completo
  if (isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(start))) {
    const isCurrentMonth =
      start.getFullYear() === today.getFullYear() && start.getMonth() === today.getMonth()
    if (isCurrentMonth) {
      // Mês corrente: compara do dia 1 até hoje contra o mesmo intervalo do mês anterior.
      const previousEnd = subMonths(today, 1)
      return {
        previous: { start: startOfMonth(previousEnd), end: previousEnd },
        label: 'em relação ao mês anterior (até hoje)'
      }
    }
    const previousMonth = subMonths(start, 1)
    return {
      previous: { start: startOfMonth(previousMonth), end: endOfMonth(previousMonth) },
      label: 'em relação ao mês anterior'
    }
  }

  // Ano completo
  if (isSameDay(start, startOfYear(start)) && isSameDay(end, endOfYear(start))) {
    const isCurrentYear = start.getFullYear() === today.getFullYear()
    if (isCurrentYear) {
      const previousEnd = subYears(today, 1)
      return {
        previous: { start: startOfYear(previousEnd), end: previousEnd },
        label: 'em relação ao ano anterior (até hoje)'
      }
    }
    const previousYear = subYears(start, 1)
    return {
      previous: { start: startOfYear(previousYear), end: endOfYear(previousYear) },
      label: 'em relação ao ano anterior'
    }
  }

  // Semana (7 dias começando no domingo)
  if (differenceInCalendarDays(end, start) === 6 && start.getDay() === WEEK_STARTS_ON) {
    const isCurrentWeek = today >= start && today <= end
    if (isCurrentWeek) {
      // Semana corrente: compara do início da semana até hoje contra o mesmo
      // intervalo da semana anterior.
      return {
        previous: { start: subWeeks(start, 1), end: subWeeks(today, 1) },
        label: 'em relação à semana anterior (até hoje)'
      }
    }
    return {
      previous: { start: subWeeks(start, 1), end: subWeeks(end, 1) },
      label: 'em relação à semana anterior'
    }
  }

  // Intervalo livre: período imediatamente anterior de mesma duração
  const lengthInDays = differenceInCalendarDays(end, start) + 1
  return {
    previous: { start: subDays(start, lengthInDays), end: subDays(start, 1) },
    label: 'em relação ao período anterior'
  }
}
