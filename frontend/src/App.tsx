import { TopBar } from './components/layout/TopBar'
import { RightSidebar } from './components/layout/RightSidebar'
import { GlobeView } from './components/globe/GlobeView'
import { useFlights } from './hooks/useFlights'
import { useCameras } from './hooks/useCameras'

function App() {
  useFlights()
  useCameras()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0a0e1a' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GlobeView />
        </div>
        <RightSidebar />
      </div>
    </div>
  )
}

export default App
