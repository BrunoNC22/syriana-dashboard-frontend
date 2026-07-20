import { Paginacao, TAMANHOS_PAGINA } from '@renderer/components/usePaginacao'

/**
 * Barra de paginação, desenhada para ficar acoplada ao rodapé da tabela
 * (dentro da mesma borda). Some no print — no papel todas as linhas aparecem
 * (ver `usePaginacao`).
 */
export const TablePagination = ({
  paginacao
}: {
  paginacao: Paginacao
}): React.JSX.Element | null => {
  const { pagina, tamanho, total, totalPaginas, inicio, fim, setTamanho, irPara } = paginacao

  // Cabe tudo na menor página: a barra só ocuparia espaço sem oferecer escolha.
  if (total <= TAMANHOS_PAGINA[0]) return null

  return (
    <div className="print:hidden flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant bg-surface-container-low px-stack-md py-stack-sm text-xs text-on-surface-variant">
      <span className="opacity-70">
        Mostrando{' '}
        <span className="font-data-display font-bold text-on-surface">
          {(inicio + 1).toLocaleString('pt-BR')}–{fim.toLocaleString('pt-BR')}
        </span>{' '}
        de {total.toLocaleString('pt-BR')}
      </span>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 opacity-70 whitespace-nowrap">
          Por página
          <select
            value={tamanho}
            onChange={(e) => setTamanho(Number(e.target.value))}
            className="bg-surface-container-high border border-outline-variant rounded px-1.5 py-0.5 text-on-surface cursor-pointer focus:outline-none focus:border-primary/40 transition-colors"
          >
            {TAMANHOS_PAGINA.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <BotaoPagina
            icone="chevron_left"
            rotulo="Página anterior"
            desabilitado={pagina === 1}
            onClick={() => irPara(pagina - 1)}
          />
          <span className="px-1 whitespace-nowrap font-data-display">
            {pagina} / {totalPaginas}
          </span>
          <BotaoPagina
            icone="chevron_right"
            rotulo="Próxima página"
            desabilitado={pagina === totalPaginas}
            onClick={() => irPara(pagina + 1)}
          />
        </div>
      </div>
    </div>
  )
}

const BotaoPagina = ({
  icone,
  rotulo,
  desabilitado,
  onClick
}: {
  icone: string
  rotulo: string
  desabilitado: boolean
  onClick: () => void
}): React.JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    disabled={desabilitado}
    title={rotulo}
    aria-label={rotulo}
    className="w-6 h-6 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant disabled:cursor-default transition-colors"
  >
    <span className="material-symbols-outlined text-[16px]">{icone}</span>
  </button>
)
