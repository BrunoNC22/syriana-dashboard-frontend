import { useEffect, useRef, useState } from 'react'
import { EtiquetaChip } from './EtiquetaChip'

type Props = {
  /** Etiquetas distintas disponíveis (na ordem de exibição). `null` = sem categoria. */
  etiquetas: (string | null)[]
  /** Etiqueta selecionada. `undefined` = todas. */
  value: string | null | undefined
  onChange: (value: string | null | undefined) => void
}

/**
 * Dropdown de filtro por etiqueta com chips coloridos — as mesmas cores que
 * aparecem na tabela (via EtiquetaChip). `<option>` nativo não colore o chip de
 * fundo de forma consistente, por isso é um dropdown customizado.
 */
export const EtiquetaSelect = ({ etiquetas, value, onChange }: Props): React.JSX.Element => {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const aoClicarFora = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  const selecionar = (v: string | null | undefined): void => {
    onChange(v)
    setAberto(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors text-sm"
      >
        {value === undefined ? (
          <span className="text-on-surface-variant">Todas as etiquetas</span>
        ) : (
          <EtiquetaChip etiqueta={value} />
        )}
        <span className="material-symbols-outlined text-base text-on-surface-variant">
          {aberto ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {aberto && (
        <div className="absolute right-0 z-20 mt-1 min-w-[200px] max-h-72 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container shadow-lg py-1">
          <Opcao ativo={value === undefined} onClick={() => selecionar(undefined)}>
            <span className="text-sm text-on-surface-variant">Todas as etiquetas</span>
          </Opcao>
          {etiquetas.map((e, i) => (
            <Opcao key={i} ativo={value === e} onClick={() => selecionar(e)}>
              <EtiquetaChip etiqueta={e} />
            </Opcao>
          ))}
        </div>
      )}
    </div>
  )
}

const Opcao = ({
  ativo,
  onClick,
  children
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-surface-container-high transition-colors ${
      ativo ? 'bg-surface-container-high' : ''
    }`}
  >
    {children}
    {ativo && <span className="material-symbols-outlined text-sm text-primary">check</span>}
  </button>
)
