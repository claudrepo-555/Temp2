import { useWorldViewStore } from '../../store/worldviewStore'
import { useAIChat } from '../../hooks/useAIChat'
import { metersToFeet, msToKnots, headingToCompass, verticalRateLabel, flightColor } from '../../lib/formatters'

export function FlightDetail() {
  const { selectedFlight, selectFlight } = useWorldViewStore()
  const { sendMessage } = useAIChat()

  if (!selectedFlight) return null

  const color = flightColor(selectedFlight)
  const callsign = selectedFlight.callsign || selectedFlight.icao24

  const askAI = () => {
    const alt = selectedFlight.baro_altitude
    const vel = selectedFlight.velocity
    sendMessage(
      `Tell me about this aircraft: ${callsign} (ICAO: ${selectedFlight.icao24}), from ${selectedFlight.origin_country}, currently at ${metersToFeet(alt)}, speed ${msToKnots(vel)}, heading ${headingToCompass(selectedFlight.heading)}. Is this flight pattern notable? Any context?`,
    )
  }

  return (
    <div className="border border-[#00d4ff22] rounded bg-[#0f1629] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#00d4ff15]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 32 32" style={{ fill: color, flexShrink: 0 }}>
            <path d="M16,4 L19,14 L26,17 L26,20 L19,18 L18,24 L21,26 L21,28 L16,27 L11,28 L11,26 L14,24 L13,18 L6,20 L6,17 L13,14 Z" />
          </svg>
          <span className="font-mono font-bold text-sm" style={{ color }}>
            {callsign}
          </span>
          {selectedFlight.on_ground && (
            <span className="text-[10px] font-mono text-[#888] bg-[#88888822] px-1 rounded">
              ON GROUND
            </span>
          )}
        </div>
        <button
          onClick={() => selectFlight(null)}
          className="text-[#5a7a9f] hover:text-[#e8eef7] text-xs leading-none"
        >
          ✕
        </button>
      </div>

      {/* Data */}
      <div className="p-3 grid grid-cols-2 gap-2">
        <DataRow label="ICAO" value={selectedFlight.icao24.toUpperCase()} />
        <DataRow label="ORIGIN" value={selectedFlight.origin_country} />
        <DataRow label="ALTITUDE" value={metersToFeet(selectedFlight.baro_altitude)} color={color} />
        <DataRow label="SPEED" value={msToKnots(selectedFlight.velocity)} color={color} />
        <DataRow label="HEADING" value={`${selectedFlight.heading != null ? Math.round(selectedFlight.heading) : '—'}° ${headingToCompass(selectedFlight.heading)}`} />
        <DataRow label="VERT RATE" value={verticalRateLabel(selectedFlight.vertical_rate)} />
        {selectedFlight.squawk && (
          <DataRow label="SQUAWK" value={selectedFlight.squawk} />
        )}
        <DataRow label="POSITION" value={`${selectedFlight.lat.toFixed(3)}°N ${Math.abs(selectedFlight.lon).toFixed(3)}°W`} />
      </div>

      {/* Ask AI button */}
      <div className="px-3 pb-3">
        <button
          onClick={askAI}
          className="w-full text-xs font-mono py-2 rounded border border-[#00d4ff55] bg-[#00d4ff11] text-[#00d4ff] hover:bg-[#00d4ff22] hover:border-[#00d4ff] transition-colors"
        >
          Ask AI about this flight →
        </button>
      </div>
    </div>
  )
}

function DataRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-mono text-[#5a7a9f] uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono" style={{ color: color ?? '#e8eef7' }}>
        {value}
      </span>
    </div>
  )
}
