import { createContext, useContext } from 'react'

export type DateRange = {
  start: Date
  end: Date
}

export type ApplicationDateContextInterface = {
  /** Intervalo selecionado (datas locais, granularidade de dia). */
  range: DateRange
  setRange: (range: DateRange) => void
  /** Data inicial no formato ISO `yyyy-MM-dd`, pronta para a query da API. */
  startISO: string
  /** Data final (inclusiva) no formato ISO `yyyy-MM-dd`. */
  endISO: string
}

export const ApplicationDateContext = createContext<ApplicationDateContextInterface | null>(null)

export const useApplicationDate = (): ApplicationDateContextInterface => {
  const context = useContext(ApplicationDateContext)
  if (!context) throw new Error('useApplicationDate must be used within ApplicationDateProvider.')

  return context
}
