import { PropsWithChildren, useMemo, useState } from 'react'
import { ComparisonMode } from '@renderer/kpis/periodComparison'
import { ComparisonContext } from './ComparisonContext'
import { DateRange } from './ApplicationDateContext'

export const ComparisonProvider = ({ children }: PropsWithChildren): React.JSX.Element => {
  const [mode, setMode] = useState<ComparisonMode>('periodo-anterior')
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined)

  const value = useMemo(() => ({ mode, setMode, customRange, setCustomRange }), [mode, customRange])

  return <ComparisonContext value={value}>{children}</ComparisonContext>
}
