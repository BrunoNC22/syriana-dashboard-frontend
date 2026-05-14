import { useEffect, useRef, useState } from 'react'
import YearPicker from './YearPicker'

type MonthPickerProps = {
  value?: Date
  onChange?: (date: Date) => void
  minYear?: number
  maxYear?: number
}

const MONTHS = [
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

export default function MonthPicker({
  value,
  onChange,
  minYear = 2017,
  maxYear = new Date().getFullYear()
}: MonthPickerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date>(value ?? new Date())

  const [selectedYear, setSelectedYear] = useState((value ?? new Date()).getFullYear())

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectMonth = (monthIndex: number): void => {
    const newDate = new Date(selectedYear, monthIndex, 1)

    setSelectedDate(newDate)

    onChange?.(newDate)

    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center gap-2
          rounded-full
          border border-outline-variant
          bg-surface-container-high
          px-4 py-2
          text-on-surface
          transition-all duration-200

          hover:border-primary/40
          hover:bg-surface-container-highest

          focus:outline-none

          focus-visible:border-primary/40
          focus-visible:bg-surface-container-highest
        "
      >
        <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>

        <span className="font-body-md">
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </span>

        <span
          className={`
            material-symbols-outlined text-[18px]
            text-on-surface-variant
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : ''}
          `}
        >
          keyboard_arrow_down
        </span>
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 z-50 mt-2 w-[340px]
            overflow-hidden
            rounded-xl
            border border-outline-variant
            bg-surface-container/90
            shadow-2xl
            animate-in fade-in zoom-in-95
          "
        >
          <div
            className="
              border-b border-outline-variant
              px-4 py-3
            "
          >
            <span className="font-label-caps text-on-surface-variant">Selecione o mês</span>
          </div>

          <div className="p-4">
            <YearPicker
              value={selectedYear}
              onChange={setSelectedYear}
              minYear={minYear}
              maxYear={maxYear}
            />

            <div className="grid grid-cols-3 gap-2 mt-2">
              {MONTHS.map((month, index) => {
                const isSelected =
                  selectedDate.getMonth() === index && selectedDate.getFullYear() === selectedYear

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleSelectMonth(index)}
                    className={`
                      rounded-lg
                      px-3 py-3
                      font-body-md
                      transition-all duration-200
                      border

                      ${
                        isSelected
                          ? `
                            border-primary
                            bg-primary
                            text-on-primary
                          `
                          : `
                            border-transparent
                            bg-surface-container-high
                            text-on-surface
                            hover:border-primary/20
                            hover:bg-surface-container-highest
                          `
                      }
                    `}
                  >
                    {month.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
