import { useEffect, useMemo, useRef, useState } from 'react'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { EtiquetaChip } from '@renderer/components/EtiquetaChip'
import { useCatalogoProdutos } from './useCatalogoProdutos'
import { buscarProdutos, ProdutoCatalogo, TIPO_INSUMO } from './matching'

/**
 * Busca global de produtos no header do dashboard.
 * Filtra o catálogo (GET /produtos) no cliente e abre a mesma janela de
 * detalhes usada pelos gráficos (produto → /product-details, insumo →
 * /insumo-details). Atalho: Ctrl+K foca o campo.
 */
export function ProductSearch(): React.JSX.Element {
  const [termo, setTermo] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { startISO, endISO } = useApplicationDate()
  const catalogo = useCatalogoProdutos()

  const resultados = useMemo(
    () => buscarProdutos(catalogo.data ?? [], termo),
    [catalogo.data, termo]
  )

  // Fecha ao clicar fora (mesmo padrão do DateRangePicker/EtiquetaSelect)
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  // Ctrl+K foca o campo de busca
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent): void => {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const abrirDetalhes = (produto: ProdutoCatalogo): void => {
    const query = `dataInicio=${startISO}&dataFim=${endISO}`
    const rota =
      produto.tipo === TIPO_INSUMO
        ? `/insumo-details/${produto.idProduto}?${query}`
        : `/product-details/${produto.id}?${query}`

    window.electron.openWindow(rota, {
      width: 640,
      height: 760,
      resizable: true,
      maximizable: true,
      minimizable: true,
      title: produto.nome,
      center: true
    })

    setIsOpen(false)
    setTermo('')
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (!isOpen || resultados.length === 0) {
      if (event.key === 'Escape') inputRef.current?.blur()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((h) => (h + 1) % resultados.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((h) => (h - 1 + resultados.length) % resultados.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      abrirDetalhes(resultados[highlight])
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <div
        className="
        flex items-center gap-2 rounded-full
        border border-outline-variant bg-surface-container-high
        px-4 py-2 transition-all duration-200 w-[260px]
        hover:border-primary/40 focus-within:border-primary/40
      "
      >
        <span className="material-symbols-outlined text-[18px] text-primary">search</span>
        <input
          ref={inputRef}
          type="text"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value)
            setIsOpen(true)
            setHighlight(0)
          }}
          onFocus={() => termo && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar produto…"
          className="
            w-full bg-transparent font-body-md text-on-surface
            placeholder:text-on-surface-variant placeholder:opacity-60
            focus:outline-none
          "
        />
        {termo && (
          <button
            type="button"
            onClick={() => {
              setTermo('')
              inputRef.current?.focus()
            }}
            className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-on-surface"
          >
            close
          </button>
        )}
      </div>

      {isOpen && termo.trim() && (
        <div
          className="
          absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl
          border border-outline-variant bg-surface-container shadow-2xl
        "
        >
          {resultados.length === 0 ? (
            <div className="flex items-center gap-2 p-4 text-sm text-on-surface-variant opacity-70">
              <span className="material-symbols-outlined text-lg">search_off</span>
              Nenhum produto encontrado.
            </div>
          ) : (
            <ul>
              {resultados.map((produto, i) => (
                <li key={`${produto.tipo}-${produto.id}`}>
                  <button
                    type="button"
                    onClick={() => abrirDetalhes(produto)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors ${
                      i === highlight ? 'bg-surface-container-high' : ''
                    }`}
                  >
                    <span className="truncate font-body-md text-on-surface">{produto.nome}</span>
                    <EtiquetaChip etiqueta={produto.etiqueta} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
