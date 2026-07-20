import { JSX } from 'react'
import { TotalVendidoKPI } from '@renderer/kpis/TotalVendidoKPI'
import { QuantidadeDePedidosKPI } from '@renderer/kpis/QuantidadeDePedidosKPI'
import { LucroTotalKPI } from '@renderer/kpis/LucroTotalKPI'
import { CustoTotalInsumosKPI } from '@renderer/kpis/CustoTotalInsumosKPI'
import { FaturamentoPrevistoKPI } from '@renderer/kpis/FaturamentoPrevistoKPI'
import { VarianteShell } from '@renderer/features/dashboard-variantes/VarianteShell'
import { VARIANTES } from '@renderer/features/dashboard-variantes/variantes'

/**
 * Dashboard 1 — a versão atual, servindo de referência na comparação de
 * variantes. A faixa de KPIs abaixo é exatamente a que já estava no ar; só o
 * cabeçalho, o painel de decisões e a área de gráficos passaram a vir da
 * moldura compartilhada, para que as quatro telas difiram apenas nos KPIs.
 */
export const DashboardContent = (): JSX.Element => {
  return (
    <VarianteShell variante={VARIANTES[0]}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <TotalVendidoKPI />
        <QuantidadeDePedidosKPI />
        <LucroTotalKPI />
        <CustoTotalInsumosKPI />
        <FaturamentoPrevistoKPI />
      </div>
    </VarianteShell>
  )
}
