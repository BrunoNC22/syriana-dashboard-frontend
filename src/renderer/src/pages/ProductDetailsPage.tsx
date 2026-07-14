import { JSX } from 'react'
import { useParams } from 'react-router-dom'

export function ProductDetailsPage(): JSX.Element {
  const { productId } = useParams<{ productId: string }>()

  return (
    <div className="flex items-center justify-center h-screen bg-[#0D0D0D] text-[#F5F5F5]">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#C8A96A]">Detalhes do Produto</h1>
        <p className="text-[#BFBFBF]">
          ID do produto:{' '}
          <span className="text-[#F5F5F5] font-semibold">{productId}</span>
        </p>
      </div>
    </div>
  )
}
