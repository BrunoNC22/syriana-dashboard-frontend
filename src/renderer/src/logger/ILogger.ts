export type LogProps = {
  logLevel: 'info' | 'warning' | 'error'
  info: string
}

export interface ILogger {
  log: (props: LogProps) => Promise<void>
  info: (data: string) => Promise<void>
  warning: (data: string) => Promise<void>
  error: (data: string) => Promise<void>
}
