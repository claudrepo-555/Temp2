import { useState, useEffect } from 'react'
import { useWorldViewStore } from '../../store/worldviewStore'
import { useAIChat } from '../../hooks/useAIChat'

export function CameraFeed() {
  const { selectedCamera, selectCamera } = useWorldViewStore()
  const { sendMessage } = useAIChat()
  const [refreshKey, setRefreshKey] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!autoRefresh || !selectedCamera) return
    const timer = setInterval(() => setRefreshKey((k) => k + 1), 30000)
    return () => clearInterval(timer)
  }, [autoRefresh, selectedCamera])

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [selectedCamera, refreshKey])

  if (!selectedCamera) return null

  const snapshotUrl = `/api/cameras/${selectedCamera.id}/snapshot?t=${refreshKey}`

  const analyzeWithAI = () => {
    sendMessage(`Analyze this Austin traffic camera feed: ${selectedCamera.name}. Describe traffic density, any incidents or congestion, road conditions, and anything notable.`, true)
  }

  return (
    <div className="border border-[#00d4ff22] rounded bg-[#0f1629] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#00d4ff15]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
          <span className="text-xs font-mono text-[#00d4ff] truncate max-w-[180px]">
            {selectedCamera.name}
          </span>
        </div>
        <button
          onClick={() => selectCamera(null)}
          className="text-[#5a7a9f] hover:text-[#e8eef7] text-xs leading-none"
          aria-label="Close camera"
        >
          ✕
        </button>
      </div>

      {/* Camera image */}
      <div className="relative bg-[#080d1a] aspect-video">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#00d4ff33] border-t-[#00d4ff] rounded-full animate-spin" />
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center text-[#5a7a9f] text-xs font-mono">
            Camera offline
          </div>
        )}
        <img
          key={`${selectedCamera.id}-${refreshKey}`}
          src={snapshotUrl}
          alt={selectedCamera.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(false) }}
        />
        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#0a0e1a99] px-2 py-0.5 rounded text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-pulse" />
          <span className="text-[#ff3344]">LIVE</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 p-2 border-t border-[#00d4ff10]">
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex-1 text-xs font-mono py-1.5 rounded border border-[#00d4ff33] text-[#00d4ff] hover:border-[#00d4ff] hover:bg-[#00d4ff11] transition-colors"
        >
          ↺ Refresh
        </button>
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex-1 text-xs font-mono py-1.5 rounded border transition-colors ${
            autoRefresh
              ? 'border-[#00ff88] text-[#00ff88] bg-[#00ff8811]'
              : 'border-[#00d4ff33] text-[#5a7a9f] hover:border-[#00d4ff33] hover:text-[#00d4ff]'
          }`}
        >
          {autoRefresh ? '⏸ Auto' : '▶ Auto'}
        </button>
        <button
          onClick={analyzeWithAI}
          className="flex-1 text-xs font-mono py-1.5 rounded border border-[#00d4ff55] bg-[#00d4ff11] text-[#00d4ff] hover:bg-[#00d4ff22] hover:border-[#00d4ff] transition-colors"
        >
          AI Analyze
        </button>
      </div>

      {/* Camera ID */}
      <div className="px-3 pb-2 text-[10px] font-mono text-[#5a7a9f]">
        CAM-{selectedCamera.id} · {selectedCamera.lat.toFixed(4)}°N {Math.abs(selectedCamera.lon).toFixed(4)}°W
      </div>
    </div>
  )
}
