import { useEffect, useRef } from 'react'
import { useWorldViewStore } from '../store/worldviewStore'

const POLL_INTERVAL = 15000

export function useFlights() {
  const { viewportCenter, setFlights } = useWorldViewStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFlights = async () => {
    const zoom = viewportCenter.zoom
    const spread = Math.max(3, 15 - zoom)
    const params = new URLSearchParams({
      lamin: String(viewportCenter.lat - spread),
      lomin: String(viewportCenter.lon - spread * 1.5),
      lamax: String(viewportCenter.lat + spread),
      lomax: String(viewportCenter.lon + spread * 1.5),
    })
    try {
      const res = await fetch(`/api/flights?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setFlights(data.flights || [], data.time || Date.now() / 1000)
    } catch {
      // Network error - silently ignore, keep stale data
    }
  }

  useEffect(() => {
    fetchFlights()
    timerRef.current = setInterval(fetchFlights, POLL_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [viewportCenter.lat, viewportCenter.lon])

  return { refetch: fetchFlights }
}
