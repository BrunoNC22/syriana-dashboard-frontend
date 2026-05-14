import { JSX, useEffect, useState } from 'react'
import { DashboardChart } from '../charts/DashboardChart'
import { FaturamentoChart } from '../charts/FaturamentoChart'
import { ProdutosMaisVendidosChart } from '../charts/ProdutosMaisVendidosChart'
import { ProdutosQueMaisFaturaramChart } from '../charts/ProdutosQueMaisFaturaramChart'
import MonthPicker from './MonthPicker'
import { useApplicationDate } from '@renderer/contexts/ApplicationDateContext'
import { TotalVendidoKPI } from '@renderer/kpis/TotalVendidoKPI'
import { QuantidadeDePedidosKPI } from '@renderer/kpis/QuantidadeDePedidosKPI'
import { FaturamentoMedioPorHoraPorDiaSemanaWidget } from '@renderer/widgets/FaturamentoMedioPorHoraPorDiaSemanaWidget'

export const DashboardContent = (): JSX.Element => {
  const { month, setMonth, setYear, year } = useApplicationDate()
  const [date, setDate] = useState(new Date(year, month - 1))

  useEffect(() => {
    setMonth(date.getMonth() + 1)
    setYear(date.getFullYear())
  }, [date, setMonth, setYear])
  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between">
        <h1 className="font-h1 text-primary text-h2 sm:text-h1">Syriana Dashboard</h1>
        <MonthPicker value={date} onChange={setDate} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <TotalVendidoKPI />
        <QuantidadeDePedidosKPI />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <DashboardChart
          title="Top 10 produtos mais vendidos"
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
          title="Top 10 produtos que mais faturaram"
          ChartElement={ProdutosQueMaisFaturaramChart}
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
