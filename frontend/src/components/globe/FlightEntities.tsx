import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import { useWorldViewStore } from '../../store/worldviewStore'
import { flightColor } from '../../lib/formatters'
import type { Flight } from '../../types/flight'

interface FlightEntitiesProps {
  viewer: Cesium.Viewer | null
}

// Generate a data URI for the airplane SVG icon at a given color
function makeAirplaneIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <g transform="translate(16,16)">
      <path d="M0,-12 L3,-2 L10,2 L10,5 L3,3 L2,8 L5,10 L5,12 L0,11 L-5,12 L-5,10 L-2,8 L-3,3 L-10,5 L-10,2 L-3,-2 Z"
        fill="${color}" opacity="0.9"/>
      <circle cx="0" cy="0" r="2" fill="${color}" opacity="0.5"/>
    </g>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const iconCache = new Map<string, string>()

function getIcon(color: string): string {
  if (!iconCache.has(color)) {
    iconCache.set(color, makeAirplaneIcon(color))
  }
  return iconCache.get(color)!
}

export function FlightEntities({ viewer }: FlightEntitiesProps) {
  const { flights, showFlights, selectFlight, selectedFlight } = useWorldViewStore()
  const entityMapRef = useRef<Map<string, Cesium.Entity>>(new Map())
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null)

  // Set up click handler
  useEffect(() => {
    if (!viewer) return
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(event.position)
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
        const entity = picked.id as Cesium.Entity
        const flightData = (entity as unknown as { _flightData?: Flight })._flightData
        if (flightData) {
          selectFlight(flightData)
        }
      } else {
        // Click on empty space - deselect
        selectFlight(null)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handlerRef.current = handler
    return () => {
      handler.destroy()
      handlerRef.current = null
    }
  }, [viewer])

  // Update flight entities
  useEffect(() => {
    if (!viewer) return
    const existingMap = entityMapRef.current
    const updatedKeys = new Set<string>()

    if (showFlights) {
      for (const flight of flights) {
        if (flight.lat == null || flight.lon == null) continue
        const key = flight.icao24
        updatedKeys.add(key)
        const alt = flight.baro_altitude ?? 0
        const color = flightColor(flight)
        const heading = flight.heading ?? 0

        const position = Cesium.Cartesian3.fromDegrees(flight.lon, flight.lat, Math.max(alt, 0))
        const label = flight.callsign ?? flight.icao24
        const isSelected = selectedFlight?.icao24 === flight.icao24

        if (existingMap.has(key)) {
          const entity = existingMap.get(key)!
          entity.position = new Cesium.ConstantPositionProperty(position)
          if (entity.billboard) {
            entity.billboard.rotation = new Cesium.ConstantProperty(Cesium.Math.toRadians(-heading))
            entity.billboard.image = new Cesium.ConstantProperty(getIcon(color))
            entity.billboard.scale = new Cesium.ConstantProperty(isSelected ? 1.4 : 1.0)
          }
        } else {
          const entity = viewer.entities.add({
            position,
            billboard: {
              image: getIcon(color),
              rotation: Cesium.Math.toRadians(-heading),
              alignedAxis: Cesium.Cartesian3.UNIT_Z,
              width: 32,
              height: 32,
              scale: isSelected ? 1.4 : 1.0,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: label,
              font: '11px monospace',
              fillColor: Cesium.Color.fromCssColorString(color),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          })
          ;(entity as unknown as { _flightData: Flight })._flightData = flight
          existingMap.set(key, entity)
        }
      }
    }

    // Remove stale entities
    for (const [key, entity] of existingMap) {
      if (!updatedKeys.has(key)) {
        viewer.entities.remove(entity)
        existingMap.delete(key)
      }
    }
  }, [viewer, flights, showFlights, selectedFlight])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewer) {
        for (const entity of entityMapRef.current.values()) {
          viewer.entities.remove(entity)
        }
        entityMapRef.current.clear()
      }
    }
  }, [viewer])

  return null
}
