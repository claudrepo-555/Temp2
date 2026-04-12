import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import { useWorldViewStore } from '../../store/worldviewStore'
import { FlightEntities } from './FlightEntities'
import { CameraEntities } from './CameraEntities'

const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined
if (cesiumToken) {
  Cesium.Ion.defaultAccessToken = cesiumToken
}

export function GlobeView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null)
  const { setViewportCenter, viewportCenter } = useWorldViewStore()

  useEffect(() => {
    if (!containerRef.current) return

    const v = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
    })

    // Remove all default imagery layers so we can add our own
    v.imageryLayers.removeAll()

    // Dark aesthetics
    v.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0e1a')
    v.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0d1525')
    v.scene.globe.enableLighting = false

    if (v.scene.skyAtmosphere) {
      v.scene.skyAtmosphere.show = true
    }
    v.scene.fog.enabled = true
    v.scene.fog.density = 0.0002

    // Try Google Photorealistic 3D Tiles
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
    if (googleKey) {
      Cesium.createGooglePhotorealistic3DTileset({ key: googleKey })
        .then((tileset) => {
          v.scene.primitives.add(tileset)
          v.scene.globe.show = false
        })
        .catch(() => loadFallbackTiles(v))
    } else {
      loadFallbackTiles(v)
    }

    // Fly to Austin TX
    v.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        viewportCenter.lon,
        viewportCenter.lat,
        500000,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2,
    })

    // Track camera moves
    const onMoveEnd = () => {
      const carto = v.camera.positionCartographic
      setViewportCenter({
        lat: Cesium.Math.toDegrees(carto.latitude),
        lon: Cesium.Math.toDegrees(carto.longitude),
        zoom: altitudeToZoom(carto.height),
      })
    }
    v.camera.moveEnd.addEventListener(onMoveEnd)

    setViewer(v)

    return () => {
      v.camera.moveEnd.removeEventListener(onMoveEnd)
      v.destroy()
      setViewer(null)
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="scan-line" />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* HUD corner decorations */}
      <HUDCorners />
      {/* Entity layers rendered after viewer is ready */}
      {viewer && (
        <>
          <FlightEntities viewer={viewer} />
          <CameraEntities viewer={viewer} />
        </>
      )}
    </div>
  )
}

function loadFallbackTiles(viewer: Cesium.Viewer) {
  const provider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    minimumLevel: 0,
    maximumLevel: 19,
  })
  viewer.imageryLayers.addImageryProvider(provider)
}

function altitudeToZoom(altitudeMeters: number): number {
  const log2 = Math.log2(40000000 / Math.max(altitudeMeters, 1))
  return Math.max(1, Math.min(20, log2))
}

function HUDCorners() {
  return (
    <>
      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 pointer-events-none opacity-40" style={{ borderColor: '#00d4ff' }} />
      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 pointer-events-none opacity-40" style={{ borderColor: '#00d4ff' }} />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 pointer-events-none opacity-40" style={{ borderColor: '#00d4ff' }} />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 pointer-events-none opacity-40" style={{ borderColor: '#00d4ff' }} />
    </>
  )
}
