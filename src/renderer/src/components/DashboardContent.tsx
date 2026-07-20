import { JSX } from 'react'
import DateRangePicker from './DateRangePicker'
import { DashboardCharts } from './DashboardCharts'
import { ProductSearch } from '@renderer/features/busca/ProductSearch'
import { KpisDoDashboard } from '@renderer/features/dashboard/KpisDoDashboard'

export const DashboardContent = (): JSX.Element => {
  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h1 className="font-h1 text-primary text-h2 sm:text-h1">Syriana Dashboard</h1>
        <div className="flex items-center gap-3">
          <ProductSearch />
          <DateRangePicker />
        </div>
      </div>

      <KpisDoDashboard />

      <DashboardCharts />

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
