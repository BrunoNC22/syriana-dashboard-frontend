import { ILogger } from '@renderer/logger/ILogger'
import { HttpClientGetProps, IHttpClient } from './IHttpClient'

export class HttpClientFetchAdapter implements IHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly logger: ILogger
  ) {}

  async get<T>({ url }: HttpClientGetProps): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`
    const startTime = performance.now()

    try {
      const response = await fetch(fullUrl)
      const result: T = await response.json()

      const durationInMs = (performance.now() - startTime).toFixed(2)

      await this.logger.info(
        `${fullUrl} ${response.status} ${response.statusText} - ${durationInMs} ms`
      )

      if (response.status >= 500) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      return result
    } catch (error) {
      const durationInMs = (performance.now() - startTime).toFixed(2)

      await this.logger.error(`${fullUrl} FAILED - ${durationInMs} ms \n${error}`)

      throw error
    }
  }
}
