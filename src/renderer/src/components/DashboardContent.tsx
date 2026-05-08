import { JSX } from 'react'
import { DashboardChart } from './DashboardChart'
import { FaturamentoChart } from './FaturamentoChart'
import { DashboardKPI } from './DashboardKPI'
import { ProdutosMaisVendidosChart } from './ProdutosMaisVendidosChart'
import { ProdutosQueMaisFaturaramChart } from './ProdutosQueMaisFaturaramChart'

export const DashboardContent = (): JSX.Element => {
  return (
    <>
      <section className="p-container-padding max-w-7xl mx-auto space-y-gutter">
        <div className="flex justify-between">
          <h1 className="font-h1 text-primary text-h2 sm:text-h1">Syriana Dashboard</h1>
          {/* <h1 className="font-h1 text-primary text-h2 sm:text-h1">Abril 2026</h1> */}
          <button className="flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary rounded-full font-bold border border-primary/20 hover:bg-primary/20 transition-all">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span className="font-body-md">Abril 2026</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <DashboardKPI
            title="TOTAL VENDIDO"
            text="R$ 124.500,00"
            mainIcon="payments"
            info="+12.5% em relação ao mês anterior"
            infoIcon="trending_up"
          />
          <DashboardKPI
            title="Quantidade Total de Pedidos"
            text="1.840"
            mainIcon="shopping_cart"
            info="+5.2% em relação ao mês anterior"
            infoIcon="trending_up"
          />
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

          <DashboardChart
            title="Top 10 produtos que mais faturaram"
            ChartElement={ProdutosQueMaisFaturaramChart}
            className="lg:col-span-7"
          />

          <div className="lg:col-span-5 bg-surface-container p-card-padding rounded-xl border border-outline-variant shadow-md">
            <div className="flex items-center justify-between mb-stack-lg">
              <h3 className="font-h3 text-h3 text-on-surface leading-tight">Média Hora / Dia</h3>
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-8 text-xs font-label-caps text-on-surface-variant">SEG</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full relative">
                  <div className="absolute left-[60%] w-8 h-full bg-primary/40 rounded-full blur-[2px]"></div>
                  <div className="absolute left-[60%] w-4 h-full bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-8 text-xs font-label-caps text-on-surface-variant">QUA</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full relative">
                  <div className="absolute left-[70%] w-12 h-full bg-primary/40 rounded-full blur-[2px]"></div>
                  <div className="absolute left-[70%] w-6 h-full bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-8 text-xs font-label-caps text-on-surface-variant">SEX</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full relative">
                  <div className="absolute left-[80%] w-16 h-full bg-primary/40 rounded-full blur-[2px]"></div>
                  <div className="absolute left-[80%] w-10 h-full bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-8 text-xs font-label-caps text-on-surface-variant">SAB</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full relative">
                  <div className="absolute left-[75%] w-20 h-full bg-primary/40 rounded-full blur-[2px]"></div>
                  <div className="absolute left-[75%] w-14 h-full bg-primary rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-8 text-xs font-label-caps text-on-surface-variant">DOM</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full relative">
                  <div className="absolute left-[65%] w-10 h-full bg-primary/40 rounded-full blur-[2px]"></div>
                  <div className="absolute left-[65%] w-5 h-full bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-outline-variant flex justify-between">
              <div className="text-center">
                <p className="text-[10px] font-label-caps text-on-surface-variant">PEAK HOUR</p>
                <p className="font-bold text-primary">20:30</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-label-caps text-on-surface-variant">AVG TICKET</p>
                <p className="font-bold text-primary">R$ 185</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-stack-lg py-8 border-t border-outline-variant flex justify-between items-center text-on-surface-variant opacity-50 text-xs">
          <div>© 2024 Al-Mandoos Hospitality Systems. All rights reserved.</div>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>System Health: Optimal</span>
          </div>
        </footer>
      </section>
    </>
  )
}
