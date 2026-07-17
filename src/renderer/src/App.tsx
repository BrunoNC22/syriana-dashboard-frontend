import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { DashboardContent } from './components/DashboardContent'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { InsumoDetalhesPage } from './pages/InsumoDetalhesPage'
import { GarconsPage } from './pages/GarconsPage'
import { GarcomDetalhesPage } from './pages/GarcomDetalhesPage'
import { RankingPage } from './features/ranking/RankingPage'
import { ApplicationDateProvider } from './contexts/ApplicationDateProvider'
import { ComparisonProvider } from './contexts/ComparisonProvider'
import { HttpClientProvider } from './contexts/httpClient/HttpClientProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5
    }
  }
})

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationDateProvider>
        <ComparisonProvider>
          <HttpClientProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<DashboardContent />} />
              <Route path="/garcons" element={<GarconsPage />} />
              <Route path="/garcons/:id" element={<GarcomDetalhesPage />} />
              <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
              <Route path="/insumo-details/:insumoId" element={<InsumoDetalhesPage />} />
              <Route path="/ranking/:metrica" element={<RankingPage />} />
            </Routes>
          </HttpClientProvider>
        </ComparisonProvider>
      </ApplicationDateProvider>
    </QueryClientProvider>
  )
}

export default App
