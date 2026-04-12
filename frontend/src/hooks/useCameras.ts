import { useEffect } from 'react'
import { useWorldViewStore } from '../store/worldviewStore'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useCameras() {
  const { setCameras } = useWorldViewStore()

  const fetchCameras = async () => {
    try {
      const res = await fetch('/api/cameras')
      if (!res.ok) return
      const data = await res.json()
      setCameras(data)
    } catch {
      // Silently ignore
    }
  }

  useEffect(() => {
    fetchCameras()
    const timer = setInterval(fetchCameras, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [])
}
