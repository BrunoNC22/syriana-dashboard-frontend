import { DashboardContent } from './components/DashboardContent'
import { ApplicationDateProvider } from './contexts/ApplicationDateProvider'
import { HttpClientProvider } from './contexts/httpClient/HttpClientProvider'

function App(): React.JSX.Element {
  return (
    <>
      <ApplicationDateProvider>
        <HttpClientProvider>
          <DashboardContent />
        </HttpClientProvider>
      </ApplicationDateProvider>
    </>
  )
}

export default App
