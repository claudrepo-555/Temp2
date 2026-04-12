import { useWorldViewStore } from '../../store/worldviewStore'

export function LayerControls() {
  const { showFlights, showCameras, toggleFlights, toggleCameras, flights, cameras } = useWorldViewStore()

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono text-[#5a7a9f] uppercase tracking-widest">
        Data Layers
      </p>

      <LayerToggle
        label="ADS-B Flights"
        description={`${flights.length} aircraft tracked`}
        color="#00d4ff"
        enabled={showFlights}
        onToggle={toggleFlights}
        icon={
          <svg width="14" height="14" viewBox="0 0 32 32" fill="#00d4ff">
            <path d="M16,4 L19,14 L26,17 L26,20 L19,18 L18,24 L21,26 L21,28 L16,27 L11,28 L11,26 L14,24 L13,18 L6,20 L6,17 L13,14 Z" />
          </svg>
        }
      />

      <LayerToggle
        label="Traffic Cameras"
        description={`${cameras.length} cameras online`}
        color="#00d4ff"
        enabled={showCameras}
        onToggle={toggleCameras}
        icon={
          <svg width="14" height="14" viewBox="0 0 28 28" fill="#00d4ff">
            <rect x="4" y="8" width="16" height="12" rx="2" />
            <polygon points="20,10 26,7 26,21 20,18" opacity="0.7" />
            <circle cx="11" cy="14" r="3" fill="#0f1629" />
            <circle cx="11" cy="14" r="1.5" />
          </svg>
        }
      />

      <div className="mt-4 pt-3 border-t border-[#00d4ff10]">
        <p className="text-[10px] font-mono text-[#5a7a9f] uppercase tracking-widest mb-2">
          Legend
        </p>
        <div className="space-y-1.5">
          <LegendItem color="#00d4ff" label="Cruising" />
          <LegendItem color="#00ff88" label="Ascending" />
          <LegendItem color="#ffaa00" label="Descending" />
          <LegendItem color="#888888" label="On Ground" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#00d4ff10] text-[10px] font-mono text-[#5a7a9f] space-y-1">
        <p className="uppercase tracking-widest mb-2">Data Sources</p>
        <p>✈ OpenSky Network (ADS-B)</p>
        <p>📷 Austin TxDOT Traffic</p>
        <p>🌐 Google 3D Tiles / CartoDB</p>
        <p>🤖 Claude Sonnet 4.6 (AI)</p>
      </div>
    </div>
  )
}

function LayerToggle({
  label,
  description,
  color,
  enabled,
  onToggle,
  icon,
}: {
  label: string
  description: string
  color: string
  enabled: boolean
  onToggle: () => void
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-2.5 rounded border transition-all text-left ${
        enabled
          ? 'border-[#00d4ff33] bg-[#00d4ff08]'
          : 'border-[#ffffff10] bg-transparent opacity-50'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono" style={{ color: enabled ? color : '#5a7a9f' }}>
          {label}
        </div>
        <div className="text-[10px] font-mono text-[#5a7a9f]">{description}</div>
      </div>
      {/* Toggle pill */}
      <div
        className={`w-8 h-4 rounded-full flex items-center transition-colors flex-shrink-0 ${enabled ? 'bg-[#00d4ff33]' : 'bg-[#ffffff15]'}`}
      >
        <div
          className={`w-3 h-3 rounded-full transition-transform mx-0.5 ${enabled ? 'translate-x-4 bg-[#00d4ff]' : 'translate-x-0 bg-[#5a7a9f]'}`}
        />
      </div>
    </button>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10px] font-mono text-[#5a7a9f]">{label}</span>
    </div>
  )
}
