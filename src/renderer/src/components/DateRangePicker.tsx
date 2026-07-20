import { useEffect, useMemo, useRef, useState } from 'react'
import { DayPicker, type DateRange as RdpRange } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear
} from 'date-fns'
import 'react-day-picker/style.css'
import { DateRange, useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { useComparison } from '@renderer/contexts/ComparisonContext'
import { ComparisonMode, getComparisonPeriod } from '@renderer/kpis/periodComparison'
import { hoje } from '@renderer/appClock'

type Mode = 'range' | 'month' | 'year'

const COMPARISON_OPTIONS: { id: ComparisonMode; label: string }[] = [
  { id: 'periodo-anterior', label: 'Período anterior' },
  { id: 'ano-anterior', label: 'Mesmo período do ano anterior' },
  { id: 'mes-anterior', label: 'Mesmo dia/período do mês anterior' },
  { id: 'personalizado', label: 'Personalizado…' },
  { id: 'nenhum', label: 'Sem comparação' }
]

const MODES: { id: Mode; label: string }[] = [
  { id: 'range', label: 'Intervalo' },
  { id: 'month', label: 'Mês' },
  { id: 'year', label: 'Ano' }
]

const MONTHS_LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const MONTHS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
]

const MIN_YEAR = 2017
const WEEK_STARTS_ON = 0 // domingo (convenção pt-BR)

/** Descobre em qual modo o intervalo atual melhor se encaixa. */
function rangeKind(range: DateRange): Mode {
  const { start, end } = range
  if (isSameDay(start, startOfYear(start)) && isSameDay(end, endOfYear(start))) return 'year'
  if (isSameDay(start, startOfMonth(start)) && isSameDay(end, endOfMonth(start))) return 'month'
  return 'range'
}

/** Dia da semana capitalizado quando o intervalo é um único dia; senão `null`. */
function singleDayWeekday(range: DateRange): string | null {
  if (!isSameDay(range.start, range.end)) return null
  const weekday = format(range.start, 'EEEE', { locale: ptBR })
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

/** Rótulo legível do intervalo atual para o botão de disparo. */
function describeRange(range: DateRange): string {
  const { start, end } = range
  switch (rangeKind(range)) {
    case 'year':
      return String(start.getFullYear())
    case 'month':
      return `${MONTHS_LONG[start.getMonth()]} de ${start.getFullYear()}`
    default:
      if (isSameDay(start, end)) return format(start, 'dd/MM/yyyy')
      return `${format(start, 'dd/MM/yyyy')} – ${format(end, 'dd/MM/yyyy')}`
  }
}

/** Rótulo compacto de um intervalo, usado no sufixo "vs …" do botão. */
function describeRangeShort(range: DateRange): string {
  const { start, end } = range
  switch (rangeKind(range)) {
    case 'year':
      return String(start.getFullYear())
    case 'month':
      return `${MONTHS_SHORT[start.getMonth()]}/${start.getFullYear()}`
    default:
      if (isSameDay(start, end)) return format(start, 'dd/MM/yy')
      return `${format(start, 'dd/MM/yy')}–${format(end, 'dd/MM/yy')}`
  }
}

// `build` é lazy de propósito: resolve hoje() no clique, já com o relógio pronto.
const quickRanges: { label: string; build: () => DateRange }[] = [
  { label: 'Hoje', build: () => ({ start: startOfDay(hoje()), end: startOfDay(hoje()) }) },
  {
    label: 'Esta semana',
    build: () => ({
      start: startOfWeek(hoje(), { weekStartsOn: WEEK_STARTS_ON }),
      end: endOfWeek(hoje(), { weekStartsOn: WEEK_STARTS_ON })
    })
  },
  {
    label: 'Este mês',
    build: () => ({ start: startOfMonth(hoje()), end: endOfMonth(hoje()) })
  },
  {
    label: 'Este ano',
    build: () => ({ start: startOfYear(hoje()), end: endOfYear(hoje()) })
  }
]

export default function DateRangePicker(): React.JSX.Element {
  const { range, setRange } = useApplicationDate()
  const {
    mode: comparisonMode,
    setMode: setComparisonMode,
    customRange,
    setCustomRange
  } = useComparison()

  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>(() => rangeKind(range))
  const [tempRange, setTempRange] = useState<RdpRange | undefined>({
    from: range.start,
    to: range.end
  })
  const [monthNavYear, setMonthNavYear] = useState(range.start.getFullYear())

  // Sub-passo de seleção do período de comparação personalizado.
  const [comparePicking, setComparePicking] = useState(false)
  const [compareTempRange, setCompareTempRange] = useState<RdpRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined
  )

  const weekday = singleDayWeekday(range)
  const comparison = useMemo(
    () => getComparisonPeriod(range, comparisonMode, customRange),
    [range, comparisonMode, customRange]
  )

  const containerRef = useRef<HTMLDivElement>(null)

  const maxYear = hoje().getFullYear()
  const years = useMemo(
    () => Array.from({ length: maxYear - MIN_YEAR + 1 }, (_, i) => maxYear - i),
    [maxYear]
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openPopover = (): void => {
    // Sincroniza o estado local com o intervalo atual ao abrir.
    setMode(rangeKind(range))
    setTempRange({ from: range.start, to: range.end })
    setMonthNavYear(range.start.getFullYear())
    setComparePicking(false)
    setIsOpen(true)
  }

  const commit = (next: DateRange): void => {
    setRange(next)
    setIsOpen(false)
  }

  const handleDayClick = (clicked: Date): void => {
    const day = startOfDay(clicked)
    const awaitingEnd = Boolean(tempRange?.from && !tempRange?.to)

    if (!awaitingEnd) {
      // Primeiro clique: define o início e mantém o popover aberto.
      setTempRange({ from: day, to: undefined })
      return
    }

    // Segundo clique: fecha a faixa (invertendo se for anterior ao início).
    const first = tempRange!.from!
    const start = day < first ? day : first
    const end = day < first ? first : day
    setTempRange({ from: start, to: end })
    commit({ start, end })
  }

  const openComparePicker = (): void => {
    setCompareTempRange(customRange ? { from: customRange.start, to: customRange.end } : undefined)
    setComparePicking(true)
  }

  const handleCompareDayClick = (clicked: Date): void => {
    const day = startOfDay(clicked)
    const awaitingEnd = Boolean(compareTempRange?.from && !compareTempRange?.to)

    if (!awaitingEnd) {
      setCompareTempRange({ from: day, to: undefined })
      return
    }

    const first = compareTempRange!.from!
    const start = day < first ? day : first
    const end = day < first ? first : day
    setCompareTempRange({ from: start, to: end })
    setCustomRange({ start, end })
    setComparisonMode('personalizado')
    setComparePicking(false)
  }

  const selectComparison = (id: ComparisonMode): void => {
    if (id === 'personalizado') {
      openComparePicker()
      return
    }
    setComparisonMode(id)
  }

  return (
    <div className="flex items-center gap-2">
      {weekday && (
        <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 font-label-caps text-label-caps text-primary">
          <span className="material-symbols-outlined text-[16px]">event</span>
          {weekday}
        </span>
      )}
      <div ref={containerRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openPopover())}
          className="
          flex items-center gap-2 rounded-full
          border border-outline-variant bg-surface-container-high
          px-4 py-2 text-on-surface transition-all duration-200
          hover:border-primary/40 hover:bg-surface-container-highest
          focus:outline-none focus-visible:border-primary/40
        "
        >
          <span className="material-symbols-outlined text-[18px] text-primary">date_range</span>
          <span className="font-body-md">{describeRange(range)}</span>
          {comparison && (
            <span className="font-body-md text-sm text-on-surface-variant">
              vs {describeRangeShort(comparison.previous)}
            </span>
          )}
          <span
            className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            keyboard_arrow_down
          </span>
        </button>

        {isOpen && (
          <div
            className="
            absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl
            border border-outline-variant bg-surface-container shadow-2xl
          "
          >
            {comparePicking ? (
              <div className="p-3">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setComparePicking(false)}
                    className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <span className="font-body-md text-on-surface">
                    Selecione o período de comparação
                  </span>
                </div>
                <div className="rdp-theme flex justify-center">
                  <DayPicker
                    mode="range"
                    locale={ptBR}
                    selected={compareTempRange}
                    onSelect={(_selected, triggerDate) => handleCompareDayClick(triggerDate)}
                    numberOfMonths={1}
                    defaultMonth={customRange?.start ?? range.start}
                    startMonth={new Date(MIN_YEAR, 0)}
                    endMonth={new Date(maxYear, 11)}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Alternador de modo */}
                <div className="flex gap-1 border-b border-outline-variant p-2">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`flex-1 rounded-lg px-3 py-1.5 font-label-caps text-label-caps transition-all duration-200 ${
                        mode === m.id
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="p-3">
                  {mode === 'range' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        {quickRanges.map((q) => (
                          <button
                            key={q.label}
                            type="button"
                            onClick={() => commit(q.build())}
                            className="
                        rounded-lg border border-outline-variant bg-surface-container-high
                        px-3 py-1.5 font-body-md text-sm text-on-surface transition-all duration-200
                        hover:border-primary/40 hover:bg-surface-container-highest
                      "
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                      <div className="rdp-theme flex justify-center">
                        <DayPicker
                          mode="range"
                          locale={ptBR}
                          selected={tempRange}
                          onSelect={(_selected, triggerDate) => handleDayClick(triggerDate)}
                          numberOfMonths={1}
                          defaultMonth={range.start}
                          startMonth={new Date(MIN_YEAR, 0)}
                          endMonth={new Date(maxYear, 11)}
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'month' && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setMonthNavYear((y) => Math.max(MIN_YEAR, y - 1))}
                          disabled={monthNavYear <= MIN_YEAR}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            chevron_left
                          </span>
                        </button>
                        <span className="font-body-md text-on-surface">{monthNavYear}</span>
                        <button
                          type="button"
                          onClick={() => setMonthNavYear((y) => Math.min(maxYear, y + 1))}
                          disabled={monthNavYear >= maxYear}
                          className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            chevron_right
                          </span>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {MONTHS_SHORT.map((label, index) => {
                          const isSelected =
                            rangeKind(range) === 'month' &&
                            range.start.getFullYear() === monthNavYear &&
                            range.start.getMonth() === index
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() =>
                                commit({
                                  start: startOfMonth(new Date(monthNavYear, index, 1)),
                                  end: endOfMonth(new Date(monthNavYear, index, 1))
                                })
                              }
                              className={`rounded-lg border px-3 py-2.5 font-body-md text-sm transition-all duration-200 ${
                                isSelected
                                  ? 'border-primary bg-primary text-on-primary'
                                  : 'border-transparent bg-surface-container-high text-on-surface hover:border-primary/20 hover:bg-surface-container-highest'
                              }`}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {mode === 'year' && (
                    <div className="grid max-h-[280px] grid-cols-3 gap-2 overflow-y-auto">
                      {years.map((year) => {
                        const isSelected =
                          rangeKind(range) === 'year' && range.start.getFullYear() === year
                        return (
                          <button
                            key={year}
                            type="button"
                            onClick={() =>
                              commit({
                                start: startOfYear(new Date(year, 0, 1)),
                                end: endOfYear(new Date(year, 0, 1))
                              })
                            }
                            className={`rounded-lg border px-3 py-2.5 font-body-md text-sm transition-all duration-200 ${
                              isSelected
                                ? 'border-primary bg-primary text-on-primary'
                                : 'border-transparent bg-surface-container-high text-on-surface hover:border-primary/20 hover:bg-surface-container-highest'
                            }`}
                          >
                            {year}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Seção de comparação */}
                <div className="border-t border-outline-variant p-2">
                  <div className="px-1 pb-1.5 font-label-caps text-label-caps text-on-surface-variant">
                    Comparar com
                  </div>
                  <div className="flex flex-col">
                    {COMPARISON_OPTIONS.map((opt) => {
                      const isActive = comparisonMode === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => selectComparison(opt.id)}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                            isActive
                              ? 'bg-surface-container-high'
                              : 'hover:bg-surface-container-high'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${
                              isActive ? 'text-primary' : 'text-on-surface-variant'
                            }`}
                          >
                            {isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                          <span className="flex flex-col">
                            <span
                              className={`font-body-md text-sm ${
                                isActive ? 'text-on-surface' : 'text-on-surface-variant'
                              }`}
                            >
                              {opt.label}
                            </span>
                            {opt.id === 'personalizado' && customRange && (
                              <span className="font-body-md text-xs text-on-surface-variant">
                                {describeRangeShort(customRange)}
                              </span>
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
