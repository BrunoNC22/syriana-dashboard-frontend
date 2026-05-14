import { createContext, useContext } from 'react'

export type ApplicationDateContextInterface = {
  month: number
  setMonth: (newMonth: number) => void
  year: number
  setYear: (newYear: number) => void
}

export const ApplicationDateContext = createContext<ApplicationDateContextInterface | null>(null)

export const useApplicationDate = (): ApplicationDateContextInterface => {
  const context = useContext(ApplicationDateContext)
  if (!context) throw new Error('useApplicationDate must be used within ApplicationDateProvider.')

  return context
}
