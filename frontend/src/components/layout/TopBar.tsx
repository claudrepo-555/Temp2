import { useWorldViewStore } from '../../store/worldviewStore'

export function TopBar() {
  const { flights, cameras, flightLoadTime } = useWorldViewStore()

  const lastUpdateStr = flightLoadTime
    ? new Date(flightLoadTime * 1000).toLocaleTimeString('en-US', { hour12: false })
    : '--:--:--'

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b z-20 flex-shrink-0"
      style={{
        background: '#0a0e1a',
        borderColor: 'rgba(0,212,255,0.2)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-7 h-7 rounded border flex items-center justify-center"
            style={{
              borderColor: 'rgba(0,212,255,0.6)',
              background: 'rgba(0,212,255,0.08)',
              boxShadow: '0 0 10px rgba(0,212,255,0.2)',
            }}
          >
            <span className="text-[10px] font-mono" style={{ color: '#00d4ff' }}>WV</span>
          </div>
          <div
            className="absolute inset-0 rounded border animate-pulse"
            style={{ borderColor: 'rgba(0,212,255,0.3)' }}
          />
        </div>
        <div>
          <span
            className="text-sm font-mono font-bold tracking-widest uppercase"
            style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.4)' }}
          >
            WorldView
          </span>
          <span className="text-[10px] font-mono ml-2" style={{ color: '#5a7a9f' }}>
            INTELLIGENCE DASHBOARD
          </span>
        </div>
      </div>

      {/* Center status */}
      <div className="flex items-center gap-4">
        <StatusBadge
          icon="✈"
          value={flights.length}
          label="FLIGHTS"
          color="#00d4ff"
        />
        <StatusBadge
          icon="📷"
          value={cameras.length}
          label="CAMERAS"
          color="#00d4ff"
        />
        <div className="text-[10px] font-mono" style={{ color: '#5a7a9f' }}>
          LAST UPDATE <span style={{ color: '#00d4ff' }}>{lastUpdateStr}</span>
        </div>
      </div>

      {/* Right: system status */}
      <div className="flex items-center gap-4 text-[10px] font-mono">
        <SystemLight label="ADS-B" active />
        <SystemLight label="CAM" active />
        <SystemLight label="AI" active />
        <div style={{ color: '#5a7a9f' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </header>
  )
}

function StatusBadge({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded border"
      style={{ borderColor: `${color}33`, background: `${color}08` }}
    >
      <span>{icon}</span>
      <span className="font-mono font-bold text-xs" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px] font-mono" style={{ color: '#5a7a9f' }}>
        {label}
      </span>
    </div>
  )
}

function SystemLight({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : ''}`}
        style={{ background: active ? '#00ff88' : '#ff3344' }}
      />
      <span style={{ color: active ? '#00ff88' : '#ff3344' }}>{label}</span>
    </div>
  )
}
