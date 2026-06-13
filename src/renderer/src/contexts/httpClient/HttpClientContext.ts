import { IHttpClient } from '@renderer/httpClient/IHttpClient'
import { createContext, useContext } from 'react'

type HttpClientContextType = {
  httpClient: IHttpClient
}

export const HttpClientContext = createContext<HttpClientContextType | null>(null)

export const useHttpClient = (): HttpClientContextType => {
  const context = useContext(HttpClientContext)
  if (!context) throw new Error('useHttpClient must be used within HttpClientProvider')

  return context
}
