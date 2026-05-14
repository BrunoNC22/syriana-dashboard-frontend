import { PropsWithChildren, useState } from 'react'
import { ApplicationDateContext } from './ApplicationDateContext'

export const ApplicationDateProvider = ({ children }: PropsWithChildren): React.JSX.Element => {
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  return (
    <ApplicationDateContext
      value={{
        month,
        setMonth,
        setYear,
        year
      }}
    >
      {children}
    </ApplicationDateContext>
  )
}
