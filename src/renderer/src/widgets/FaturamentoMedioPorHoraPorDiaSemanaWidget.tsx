import { DashboardChart } from '@renderer/charts/DashboardChart'
import { FaturamentoMedioPorHoraPorDiaSemanaChart } from '@renderer/charts/FaturamentoMedioPorHoraPorDiaSemanaChart'
import WeekDayPicker from '@renderer/components/WeekDayPicker'
import { useState } from 'react'

export const FaturamentoMedioPorHoraPorDiaSemanaWidget = (): React.JSX.Element => {
  const [weekDay, setWeekDay] = useState(new Date().getDay())

  return (
    <DashboardChart
      title="Faturamento médio por hora por dia da semana"
      ChartElement={() => <FaturamentoMedioPorHoraPorDiaSemanaChart weekDay={weekDay} />}
      TitleElements={() => <WeekDayPicker weekDay={weekDay} onChange={setWeekDay} />}
      className="lg:col-span-6"
    />
  )
}
