import { PropsWithChildren, useMemo, useState } from 'react'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { ApplicationDateContext, DateRange } from './ApplicationDateContext'

export const ApplicationDateProvider = ({ children }: PropsWithChildren): React.JSX.Element => {
  const [range, setRange] = useState<DateRange>(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  }))

  const startISO = useMemo(() => format(range.start, 'yyyy-MM-dd'), [range.start])
  const endISO = useMemo(() => format(range.end, 'yyyy-MM-dd'), [range.end])

  return (
    <ApplicationDateContext value={{ range, setRange, startISO, endISO }}>
      {children}
    </ApplicationDateContext>
  )
}
