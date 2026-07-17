import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useHttpClient } from '@renderer/contexts/httpClient/HttpClientContext'
import { ProdutoCatalogo } from './matching'

/**
 * Catálogo completo de produtos ativos (~400 itens) para a busca global.
 * Carregado uma vez e filtrado no cliente — staleTime alto porque o
 * cardápio quase não muda durante uma sessão.
 */
export function useCatalogoProdutos(): UseQueryResult<ProdutoCatalogo[]> {
  const { httpClient } = useHttpClient()

  return useQuery({
    queryKey: ['produtos-catalogo'],
    queryFn: (): Promise<ProdutoCatalogo[]> =>
      httpClient.get<ProdutoCatalogo[]>({ url: '/produtos' }),
    staleTime: 30 * 60 * 1000
  })
}
