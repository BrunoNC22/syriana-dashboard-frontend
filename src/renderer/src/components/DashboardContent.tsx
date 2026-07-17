import { JSX } from 'react'
import { Link } from 'react-router-dom'
import { DashboardChart } from '../charts/DashboardChart'
import { FaturamentoChart } from '../charts/FaturamentoChart'
import { ProdutosMaisVendidosChart } from '../charts/ProdutosMaisVendidosChart'
import { ProdutosQueMaisFaturaramChart } from '../charts/ProdutosQueMaisFaturaramChart'
import DateRangePicker from './DateRangePicker'
import { TotalVendidoKPI } from '@renderer/kpis/TotalVendidoKPI'
import { QuantidadeDePedidosKPI } from '@renderer/kpis/QuantidadeDePedidosKPI'
import { LucroTotalKPI } from '@renderer/kpis/LucroTotalKPI'
import { CustoTotalInsumosKPI } from '@renderer/kpis/CustoTotalInsumosKPI'
import { FaturamentoMedioPorHoraPorDiaSemanaWidget } from '@renderer/widgets/FaturamentoMedioPorHoraPorDiaSemanaWidget'
import { InsumosQueMaisCustaramChart } from '@renderer/charts/InsumosQueMaisCustaramChart'
import { ProductSearch } from '@renderer/features/busca/ProductSearch'

export const DashboardContent = (): JSX.Element => {
  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h1 className="font-h1 text-primary text-h2 sm:text-h1">Syriana Dashboard</h1>
          <Link
            to="/garcons"
            className="px-3 py-1.5 border border-primary/20 bg-primary/5 text-primary text-sm font-bold rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">groups</span>
            Garçons
          </Link>
          <Link
            to="/saude-cardapio"
            className="px-3 py-1.5 border border-primary/20 bg-primary/5 text-primary text-sm font-bold rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">health_and_safety</span>
            Saúde do cardápio
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ProductSearch />
          <DateRangePicker />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <TotalVendidoKPI />
        <QuantidadeDePedidosKPI />
        <LucroTotalKPI />
        <CustoTotalInsumosKPI />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <DashboardChart
          title="Produtos mais vendidos"
          ChartElement={ProdutosMaisVendidosChart}
          className="lg:col-span-6"
        />

        <DashboardChart
          title="Faturamento"
          ChartElement={FaturamentoChart}
          className="lg:col-span-6"
        />

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

      <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
        <div>© 2026 Restaurante Syriana. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>System Health: Optimal</span>
        </div>
      </footer>
    </section>
  )
}
