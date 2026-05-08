import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  Filler,
  Title,
  Tooltip,
  Legend,
  ScriptableContext,
  ChartTypeRegistry
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { colors } from './colors'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
  Title,
  Tooltip,
  Legend
)

const createBackgroundColorGradient = (firstColor: string, secondColor: string) => {
  return (context: ScriptableContext<keyof ChartTypeRegistry>): CanvasGradient | undefined => {
    if (!context.chart.chartArea) return

    const gradient = context.chart.ctx.createLinearGradient(
      0,
      context.chart.chartArea.top,
      0,
      context.chart.chartArea.bottom
    )

    gradient.addColorStop(0, firstColor)
    gradient.addColorStop(1, secondColor)

    return gradient
  }
}

ChartJS.defaults.locale = 'pt'

ChartJS.defaults.maintainAspectRatio = false
ChartJS.defaults.interaction.mode = 'index'
ChartJS.defaults.interaction.intersect = false
ChartJS.defaults.scales.linear.beginAtZero = true
ChartJS.defaults.scales.linear.ticks.stepSize = 1
ChartJS.defaults.plugins.legend.position = 'top'
ChartJS.defaults.plugins.legend.display = false
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', 'Roboto', sans-serif"
ChartJS.defaults.font.size = 12
ChartJS.defaults.font.weight = 'normal'
ChartJS.defaults.color = '#d0c5b5'
ChartJS.defaults.borderColor = '#d0c5b510'

ChartJS.defaults.elements.bar.borderRadius = 7
ChartJS.defaults.elements.bar.backgroundColor = createBackgroundColorGradient(
  colors.primaryLight,
  colors.primaryDark
)

ChartJS.defaults.elements.point.pointStyle = false

ChartJS.defaults.elements.line.tension = 0.3
ChartJS.defaults.elements.line.cubicInterpolationMode = 'default'
ChartJS.defaults.elements.line.fill = true
ChartJS.defaults.elements.line.borderColor = colors.primaryLight
ChartJS.defaults.elements.line.borderWidth = 2
ChartJS.defaults.elements.line.backgroundColor = createBackgroundColorGradient(
  colors.primary,
  `${colors.primary}00`
)
