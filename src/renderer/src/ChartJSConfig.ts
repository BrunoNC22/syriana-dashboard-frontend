import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { colors } from './Colors'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

ChartJS.defaults.borderColor = colors.border
ChartJS.defaults.color = colors.textPrimary
ChartJS.defaults.plugins.legend.position = 'top'
ChartJS.defaults.elements.bar.borderRadius = 7
