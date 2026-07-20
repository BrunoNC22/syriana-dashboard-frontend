import { JSX, ReactNode, useState } from 'react'
import DateRangePicker from '@renderer/components/DateRangePicker'
import { DashboardCharts } from '@renderer/components/DashboardCharts'
import { ProductSearch } from '@renderer/features/busca/ProductSearch'
import { Variante } from './variantes'

/**
 * Painel recolhível com as decisões da variante.
 *
 * Existe só enquanto a bancada de comparação existir: sem ele, avaliar quatro
 * telas parecidas vira adivinhação sobre o que mudou em cada uma.
 */
const DecisoesDaVariante = ({ decisoes }: { decisoes: string[] }): JSX.Element => {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="border border-outline-variant bg-surface-container-low rounded-xl overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-2 text-on-surface-variant hover:bg-primary/5 transition-colors"
      >
        <span className="material-symbols-outlined text-primary text-lg">tune</span>
        <span className="text-sm font-bold">Decisões desta variante</span>
        <span className="text-xs opacity-60">({decisoes.length})</span>
        <span className="material-symbols-outlined text-lg ml-auto">
          {aberto ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {aberto && (
        <ul className="px-4 pb-4 space-y-2">
          {decisoes.map((decisao) => (
            <li
              key={decisao}
              className="flex gap-2 text-sm text-on-surface-variant opacity-80 leading-relaxed"
            >
              <span className="text-primary shrink-0">•</span>
              <span>{decisao}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Moldura comum das variantes: cabeçalho, painel de decisões, a faixa de KPIs
 * própria da variante (`children`) e a área de gráficos — igual em todas.
 */
export const VarianteShell = ({
  variante,
  children
}: {
  variante: Variante
  children: ReactNode
}): JSX.Element => {
  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="font-h1 text-primary text-h2 sm:text-h1">{variante.titulo}</h1>
        <div className="flex items-center gap-3">
          <ProductSearch />
          <DateRangePicker />
        </div>
      </div>

      <DecisoesDaVariante decisoes={variante.decisoes} />

      {children}

      <DashboardCharts />

      <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
        <div>© 2026 Restaurante Syriana. All rights reserved.</div>
        <div>{variante.resumo}</div>
      </footer>
    </section>
  )
}
