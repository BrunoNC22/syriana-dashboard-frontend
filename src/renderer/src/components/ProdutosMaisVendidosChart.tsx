import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

type RemoteProdutoVendidoType = {
  nomeProduto: string
  totalVendido: number
}

type ChartDataType = {
  x: string
  y: number
}

export const ProdutosMaisVendidosChart = (): React.JSX.Element => {
  const [chartData, setChartData] = useState<ChartDataType[]>()

  const getChartData = useCallback(async (): Promise<ChartDataType[]> => {
    const result = await fetch('http://localhost:8080/dashboard/produtos-mais-vendidos')
    const remoteData: RemoteProdutoVendidoType[] = await result.json()
    return remoteData.map((value) => ({ x: value.nomeProduto, y: value.totalVendido }))
  }, [])

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: 'Quantidade de vendas',
          data: chartData,
          maxBarThickness: 25
        }
      ]
    }),
    [chartData]
  )

  useEffect(() => {
    getChartData().then((value) => setChartData(value))
  }, [getChartData])

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: '1',
        height: '300px'
      }}
    >
      <Bar
        options={{
          scales: {
            x: {
              ticks: {
                callback: function (value) {
                  const label = this.getLabelForValue(value as number)
                  const limite = 10 // ajuste conforme sua necessidade

                  if (typeof label === 'string' && label.length > limite) {
                    return label.substring(0, limite) + '...'
                  }
                  return label
                }
              }
            },
            y: {
              ticks: {
                stepSize: 2500
              }
            }
          }
        }}
        data={data}
      />
    </div>
  )
}
