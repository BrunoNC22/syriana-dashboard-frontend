import { JSX } from 'react'
import { DashboardChart } from '../charts/DashboardChart'
import { FaturamentoChart } from '../charts/FaturamentoChart'
import { ProdutosMaisVendidosChart } from '../charts/ProdutosMaisVendidosChart'
import { ProdutosQueMaisFaturaramChart } from '../charts/ProdutosQueMaisFaturaramChart'
import { InsumosQueMaisCustaramChart } from '../charts/InsumosQueMaisCustaramChart'
import { FaturamentoMedioPorHoraPorDiaSemanaWidget } from '../widgets/FaturamentoMedioPorHoraPorDiaSemanaWidget'

/**
 * Área de gráficos do dashboard.
 *
 * Extraída para ser idêntica em todas as variantes de dashboard: com os
 * gráficos fixos, qualquer diferença percebida entre as variantes vem da faixa
 * de KPIs, que é o que está em avaliação.
 */
export const DashboardCharts = (): JSX.Element => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <DashboardChart
        title="Produtos mais vendidos"
        ChartElement={ProdutosMaisVendidosChart}
        className="lg:col-span-6"
      />

      <DashboardChart title="Faturamento" ChartElement={FaturamentoChart} className="lg:col-span-6" />

      <FaturamentoMedioPorHoraPorDiaSemanaWidget />

      <DashboardChart
        title="Produtos que mais faturaram"
        ChartElement={ProdutosQueMaisFaturaramChart}
        className="lg:col-span-6"
      />

      <DashboardChart
        title="Insumos que mais custaram"
        ChartElement={InsumosQueMaisCustaramChart}
        className="lg:col-span-6"
      />
    </div>
  )
}
