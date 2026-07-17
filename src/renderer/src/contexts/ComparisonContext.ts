import { createContext, useContext } from 'react'
import { DateRange } from './ApplicationDateContext'
import { ComparisonMode } from '@renderer/kpis/periodComparison'

export type ComparisonContextInterface = {
  /** Modo de comparação selecionado (default `'periodo-anterior'`). */
  mode: ComparisonMode
  setMode: (mode: ComparisonMode) => void
  /** Intervalo de comparação manual, usado apenas quando `mode === 'personalizado'`. */
  customRange?: DateRange
  setCustomRange: (range: DateRange | undefined) => void
}

export const ComparisonContext = createContext<ComparisonContextInterface | null>(null)

export const useComparison = (): ComparisonContextInterface => {
  const context = useContext(ComparisonContext)
  if (!context) throw new Error('useComparison must be used within ComparisonProvider.')

  return context
}
