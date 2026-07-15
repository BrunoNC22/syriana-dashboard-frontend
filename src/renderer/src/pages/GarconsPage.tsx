import { JSX } from 'react'
import { Link } from 'react-router-dom'
import DateRangePicker from '../components/DateRangePicker'
import { GarconsRanking } from '../components/GarconsRanking'

export const GarconsPage = (): JSX.Element => {
  return (
    <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <Link
            to="/"
            className="text-xs text-on-surface-variant opacity-70 hover:opacity-100 hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </Link>
          <h1 className="font-h1 text-primary text-h2 sm:text-h1 mt-1">Garçons</h1>
        </div>
        <DateRangePicker />
      </div>

      <GarconsRanking />

      <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
        <div>© 2026 Restaurante Syriana. All rights reserved.</div>
        <div>Pagamento por taxa de serviço (10%)</div>
      </footer>
    </section>
  )
}
