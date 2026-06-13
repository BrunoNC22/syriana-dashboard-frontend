import { PropsWithChildren, useMemo } from 'react'
import { HttpClientContext } from './HttpClientContext'
import { HttpClientFetchAdapter } from '@renderer/httpClient/HttpClientFetchAdapter'
import config from '@shared/config'
import { IPCLoggerAdapter } from '@renderer/logger/IPCLoggerAdapter'

export const HttpClientProvider = ({ children }: PropsWithChildren): React.JSX.Element => {
  const httpClient = useMemo(
    () =>
      new HttpClientFetchAdapter(
        `${config.server.protocol}://${config.server.host}:${config.server.port}`,
        new IPCLoggerAdapter()
      ),
    []
  )

  return <HttpClientContext.Provider value={{ httpClient }}>{children}</HttpClientContext.Provider>
}
