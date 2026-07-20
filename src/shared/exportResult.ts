/**
 * Resultado de uma exportação de arquivo feita pelo main process
 * (PDF do relatório / CSV da tabela de compras).
 *
 * `cancelado` distingue "o usuário fechou o diálogo" de "deu erro" —
 * o renderer não deve mostrar mensagem de falha quando só cancelaram.
 */
export interface ExportResult {
  ok: boolean
  /** Caminho do arquivo salvo (só quando `ok`). */
  caminho?: string
  cancelado?: boolean
  erro?: string
}
