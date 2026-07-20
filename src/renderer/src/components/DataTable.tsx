import { useMemo, useState } from 'react'

export type DataTableColumn<T> = {
  /** Identificador único da coluna (usado para o estado de ordenação). */
  key: string
  header: string
  align?: 'left' | 'right'
  /** Valor usado na ordenação. Coluna sem sortValue não é ordenável. */
  sortValue?: (row: T) => number | string
  render: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  /** Ordenação inicial. */
  initialSort?: { key: string; dir: 'asc' | 'desc' }
}

/**
 * Tabela genérica ordenável, no padrão visual das tabelas do app
 * (ver InsumoDetalhesPage). Inclui a coluna "#" com a posição na
 * ordenação atual. Filtros/busca ficam a cargo de quem usa — a
 * tabela recebe as linhas já filtradas.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  initialSort
}: DataTableProps<T>): React.JSX.Element {
  const [sort, setSort] = useState(initialSort)

  const sortedRows = useMemo(() => {
    if (!sort) return rows

    const coluna = columns.find((c) => c.key === sort.key)
    if (!coluna?.sortValue) return rows

    const getValue = coluna.sortValue
    const fator = sort.dir === 'asc' ? 1 : -1

    return [...rows].sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (typeof va === 'string' || typeof vb === 'string') {
        return String(va).localeCompare(String(vb), 'pt-BR') * fator
      }
      return (va - (vb as number)) * fator
    })
  }, [rows, sort, columns])

  const toggleSort = (coluna: DataTableColumn<T>): void => {
    if (!coluna.sortValue) return
    setSort((atual) =>
      atual?.key === coluna.key
        ? { key: coluna.key, dir: atual.dir === 'desc' ? 'asc' : 'desc' }
        : { key: coluna.key, dir: 'desc' }
    )
  }

  // print:overflow-visible — no PDF não há scroll: colunas cortadas sumiriam.
  return (
    <div className="overflow-x-auto print:overflow-visible rounded-xl border border-outline-variant shadow-md">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-container-high text-on-surface-variant">
            <th className="text-left px-stack-md py-stack-sm font-label-caps text-label-caps">#</th>
            {columns.map((coluna) => (
              <th
                key={coluna.key}
                onClick={() => toggleSort(coluna)}
                className={`px-stack-md py-stack-sm font-label-caps text-label-caps whitespace-nowrap ${
                  coluna.align === 'right' ? 'text-right' : 'text-left'
                } ${coluna.sortValue ? 'cursor-pointer select-none hover:text-on-surface' : ''}`}
              >
                <span className="inline-flex items-center gap-1">
                  {coluna.header}
                  {sort?.key === coluna.key && (
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      {sort.dir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`bg-surface-container border-t border-outline-variant transition-colors ${
                onRowClick ? 'hover:bg-surface-container-high cursor-pointer' : ''
              }`}
            >
              <td className="px-stack-md py-stack-sm text-on-surface-variant opacity-70">
                {i + 1}
              </td>
              {columns.map((coluna) => (
                <td
                  key={coluna.key}
                  className={`px-stack-md py-stack-sm whitespace-nowrap ${
                    coluna.align === 'right'
                      ? 'text-right text-on-surface-variant'
                      : 'text-on-surface'
                  }`}
                >
                  {coluna.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
