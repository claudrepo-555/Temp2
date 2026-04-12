export interface Flight {
  icao24: string
  callsign: string | null
  origin_country: string
  lat: number
  lon: number
  baro_altitude: number | null
  geo_altitude: number | null
  on_ground: boolean
  velocity: number | null
  heading: number | null
  vertical_rate: number | null
  squawk: string | null
}

export interface FlightsResponse {
  time: number
  flights: Flight[]
  from_cache: boolean
  cache_stale?: boolean
}
