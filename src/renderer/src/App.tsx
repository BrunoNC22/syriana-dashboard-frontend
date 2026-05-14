import { DashboardContent } from './components/DashboardContent'
import { ApplicationDateProvider } from './contexts/ApplicationDateProvider'

function App(): React.JSX.Element {
  return (
    <>
      <ApplicationDateProvider>
        <DashboardContent />
      </ApplicationDateProvider>
    </>
  )
}

export default App
