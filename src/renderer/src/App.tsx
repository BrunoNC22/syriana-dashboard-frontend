import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Routes, Route } from 'react-router-dom'
import { DashboardContent } from './components/DashboardContent'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { ApplicationDateProvider } from './contexts/ApplicationDateProvider'
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
        <HttpClientProvider>
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/product-details/:productId" element={<ProductDetailsPage />} />
          </Routes>
        </HttpClientProvider>
      </ApplicationDateProvider>
    </QueryClientProvider>
  )
}

export default App
