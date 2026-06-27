import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardContent } from './components/DashboardContent'
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
          <DashboardContent />
        </HttpClientProvider>
      </ApplicationDateProvider>
    </QueryClientProvider>
  )
}

export default App
