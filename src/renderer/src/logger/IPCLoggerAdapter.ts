import { ILogger, LogProps } from './ILogger'

export class IPCLoggerAdapter implements ILogger {
  async error(data: string): Promise<void> {
    return window.logger.error(data)
  }

  async info(data: string): Promise<void> {
    return await window.logger.info(data)
  }

  async log(props: LogProps): Promise<void> {
    return await window.logger.log({ info: props.info, logLevel: props.logLevel })
  }

  async warning(data: string): Promise<void> {
    return await window.logger.warning(data)
  }
}
