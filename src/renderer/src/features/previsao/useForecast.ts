import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'

/** Um ponto da série prevista (contrato de PontoPrevisaoDTO do backend). */
export type PontoPrevisao = {
  data: string
  valor: number
  limiteInferior: number
  limiteSuperior: number
  feriado: boolean
}

/** Feriado dentro do horizonte previsto (FeriadoDTO do backend). */
export type FeriadoPrevisao = {
  data: string
  nome: string
  categoria: string
}

/** Resposta de `/analytics/previsao` (PrevisaoDTO do backend). */
export type Previsao = {
  metrica: string
  metodo: string
  mape: number | null
  horizonteDias: number
  diasHistorico: number
  avisoBaixaConfianca: string | null
  pontos: PontoPrevisao[]
  feriadosNoHorizonte: FeriadoPrevisao[]
}

export type MetricaPrevisao = 'faturamento' | 'pedidos'

/**
 * Busca a previsão de uma métrica.
 *
 * O backend usa uma janela de treino interna terminando ontem (independente do
 * período selecionado no dashboard), então a query key **não** depende de
 * `dataInicio`/`dataFim` — só de métrica e horizonte. O `staleTime` espelha o
 * TTL de 10min do cache em memória do backend.
 */
export function useForecast(
  metrica: MetricaPrevisao,
  horizonte: string,
  enabled = true
): UseQueryResult<Previsao> {
  const { httpClient } = useHttpClient()

  return useQuery({
    queryKey: ['previsao', metrica, horizonte],
    queryFn: () =>
      httpClient.get<Previsao>({
        url: `/analytics/previsao?metrica=${metrica}&horizonte=${horizonte}`
      }),
    enabled,
    staleTime: 10 * 60 * 1000
  })
}
