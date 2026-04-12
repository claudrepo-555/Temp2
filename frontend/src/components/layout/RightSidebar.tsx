import { useWorldViewStore } from '../../store/worldviewStore'
import { AIChat } from '../panels/AIChat'
import { FlightDetail } from '../panels/FlightDetail'
import { CameraFeed } from '../panels/CameraFeed'
import { LayerControls } from '../panels/LayerControls'

export function RightSidebar() {
  const { activePanel, setActivePanel, selectedFlight, selectedCamera } = useWorldViewStore()

  return (
    <aside
      className="flex flex-col flex-shrink-0 border-l"
      style={{
        width: '360px',
        background: '#0f1629',
        borderColor: 'rgba(0,212,255,0.15)',
      }}
    >
      {/* Tab navigation */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ borderColor: 'rgba(0,212,255,0.12)' }}
      >
        {(['chat', 'layers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActivePanel(tab)}
            className="flex-1 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors"
            style={{
              color: activePanel === tab ? '#00d4ff' : '#5a7a9f',
              borderBottom: activePanel === tab ? '2px solid #00d4ff' : '2px solid transparent',
              background: activePanel === tab ? 'rgba(0,212,255,0.04)' : 'transparent',
            }}
          >
            {tab === 'chat' ? '⚡ Intelligence' : '☰ Layers'}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activePanel === 'chat' && (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Selected item panels */}
            {(selectedFlight || selectedCamera) && (
              <div className="p-3 space-y-2 border-b flex-shrink-0 overflow-y-auto max-h-72" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                {selectedFlight && <FlightDetail />}
                {selectedCamera && <CameraFeed />}
              </div>
            )}
            {/* AI chat takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <AIChat />
            </div>
          </div>
        )}

        {activePanel === 'layers' && (
          <div className="p-4 overflow-y-auto flex-1">
            <LayerControls />
          </div>
        )}
      </div>
    </aside>
  )
}
