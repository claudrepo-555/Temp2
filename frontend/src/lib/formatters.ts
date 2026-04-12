export function metersToFeet(m: number | null): string {
  if (m == null) return 'N/A'
  return `${Math.round(m * 3.28084).toLocaleString()} ft`
}

export function msToKnots(ms: number | null): string {
  if (ms == null) return 'N/A'
  return `${Math.round(ms * 1.94384)} kts`
}

export function headingToCompass(deg: number | null): string {
  if (deg == null) return 'N/A'
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function verticalRateLabel(rate: number | null): string {
  if (rate == null) return 'level'
  if (rate > 1) return `↑ ${Math.round(rate * 196.85)} fpm`
  if (rate < -1) return `↓ ${Math.abs(Math.round(rate * 196.85))} fpm`
  return 'level'
}

export function flightColor(flight: { on_ground: boolean; vertical_rate: number | null; baro_altitude: number | null }): string {
  if (flight.on_ground) return '#888888'
  if (flight.vertical_rate != null && flight.vertical_rate > 1) return '#00ff88'
  if (flight.vertical_rate != null && flight.vertical_rate < -1) return '#ffaa00'
  if (flight.baro_altitude == null || flight.baro_altitude < 100) return '#888888'
  return '#00d4ff'
}

export function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
