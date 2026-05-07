import { Bar } from 'react-chartjs-2'
import { useMemo } from 'react'
import { colors } from '../Colors'

export function ChartComponent(): React.JSX.Element {
  const data = useMemo(
    () => ({
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [1, 2, 3, 4, 5, 6, 7],
          backgroundColor: colors.primary,
          maxBarThickness: 30
        }
      ]
    }),
    []
  )

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Chart.js Bar Chart'
        }
      }
    }),
    []
  )

  return (
    <div style={{
      display: 'flex',
      flexGrow: '1',
      height: '300px',
      width: '500px'
    }}>
      <Bar options={options} data={data} />
    </div>
  )
}
