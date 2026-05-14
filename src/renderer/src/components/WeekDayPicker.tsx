import { useEffect, useMemo, useRef, useState } from 'react'

type WeekDayFormat = 'full' | 'medium' | 'short'

type WeekDayPickerProps = {
  weekDay: number
  onChange: (newWeekDay: number) => void
  format?: WeekDayFormat
}

const WEEK_DAYS = {
  full: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ],

  medium: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],

  short: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
}

export default function WeekDayPicker({
  weekDay,
  onChange,
  format = 'medium'
}: WeekDayPickerProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

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

  const labels = useMemo(() => {
    return WEEK_DAYS[format]
  }, [format])

  const handleSelectWeekDay = (newWeekDay: number): void => {
    onChange(newWeekDay)

    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex w-full items-center justify-between
          rounded-lg
          border border-outline-variant
          bg-surface-container-high
          px-3 py-2
          text-on-surface
          transition-all duration-200

          hover:border-primary/40
          hover:bg-surface-container-highest

          focus:outline-none

          focus-visible:border-primary/40
          focus-visible:bg-surface-container-highest
        "
      >
        <span className="font-body-md">{labels[weekDay]}</span>

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
            absolute right-0 top-[calc(100%+8px)]
            z-50
            overflow-hidden
            rounded-lg
            border border-outline-variant
            bg-surface-container/90
            shadow-2xl
          "
        >
          <div className="p-1">
            {labels.map((label, index) => {
              const isSelected = index === weekDay

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSelectWeekDay(index)}
                  className={`
                    w-full rounded-md
                    px-3 py-2
                    text-left
                    font-body-md
                    transition-all duration-200

                    ${
                      isSelected
                        ? `
                          bg-primary
                          text-on-primary
                        `
                        : `
                          text-on-surface
                          hover:bg-surface-container-high
                        `
                    }
                  `}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
