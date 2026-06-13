import { LoggerOutputPort, LogProps } from './LoggerOutputPort'
import { appendFile } from 'node:fs/promises'

export class FileLoggerAdapter implements LoggerOutputPort {
  private queue: Promise<void> = Promise.resolve()

  constructor(private readonly logFilePath: string) {}

  async log(props: LogProps): Promise<void> {
    const timestamp = new Date().toISOString()

    const line = `[${timestamp}] [${props.logLevel.toUpperCase()}] ${props.info}\n`

    this.queue = this.queue.then(() => appendFile(this.logFilePath, line, 'utf-8'))

    return this.queue
  }

  async error(data: string): Promise<void> {
    await this.log({ info: data, logLevel: 'error' })
  }

  async info(data: string): Promise<void> {
    await this.log({ info: data, logLevel: 'info' })
  }

  async warning(data: string): Promise<void> {
    await this.log({ info: data, logLevel: 'warning' })
  }
}
