import { useEffect, useMemo, useRef, useState } from 'react'

type YearPickerProps = {
  value: number
  onChange: (year: number) => void
  minYear?: number
  maxYear?: number
}

export default function YearPicker({
  value,
  onChange,
  minYear = 2017,
  maxYear = new Date().getFullYear()
}: YearPickerProps): React.JSX.Element {
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

  const years = useMemo(() => {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index).reverse()
  }, [minYear, maxYear])

  const handleSelectYear = (year: number): void => {
    onChange(year)

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
        <span className="font-body-md">{value}</span>

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
            absolute left-0 right-0 top-[calc(100%+8px)]
            z-50
            overflow-hidden
            rounded-lg
            border border-outline-variant
            bg-surface-container/90
            shadow-2xl
          "
        >
          <div className="max-h-40 overflow-y-auto p-1">
            {years.map((year) => {
              const isSelected = year === value

              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
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
                  {year}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
