export type HttpClientGetProps = {
  url: string
}

export interface IHttpClient {
  get<T>(props: HttpClientGetProps): Promise<T>
}
