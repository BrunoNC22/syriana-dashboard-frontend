import { etiquetaColor } from '@renderer/etiquetaColors'

/** Chip colorido de uma etiqueta (categoria) de produto. Cor determinística. */
export const EtiquetaChip = ({ etiqueta }: { etiqueta: string | null }): React.JSX.Element => {
  const cor = etiquetaColor(etiqueta)

  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
      style={{ backgroundColor: `${cor}22`, color: cor, borderColor: `${cor}55` }}
    >
      {etiqueta ?? 'Sem categoria'}
    </span>
  )
}
