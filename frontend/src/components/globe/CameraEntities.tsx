import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import { useWorldViewStore } from '../../store/worldviewStore'
import type { Camera } from '../../types/camera'

interface CameraEntitiesProps {
  viewer: Cesium.Viewer | null
}

const CAMERA_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <rect x="4" y="8" width="16" height="12" rx="2" fill="#00d4ff" opacity="0.85"/>
  <polygon points="20,10 26,7 26,21 20,18" fill="#00d4ff" opacity="0.7"/>
  <circle cx="11" cy="14" r="3" fill="#0a0e1a"/>
  <circle cx="11" cy="14" r="1.5" fill="#00d4ff" opacity="0.9"/>
</svg>`)}`

const CAMERA_ICON_SELECTED = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <rect x="4" y="8" width="16" height="12" rx="2" fill="#00ff88" opacity="0.9"/>
  <polygon points="20,10 26,7 26,21 20,18" fill="#00ff88" opacity="0.8"/>
  <circle cx="11" cy="14" r="3" fill="#0a0e1a"/>
  <circle cx="11" cy="14" r="1.5" fill="#00ff88"/>
</svg>`)}`

export function CameraEntities({ viewer }: CameraEntitiesProps) {
  const { cameras, showCameras, selectCamera, selectedCamera } = useWorldViewStore()
  const entityMapRef = useRef<Map<string, Cesium.Entity>>(new Map())
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null)

  // Click handler
  useEffect(() => {
    if (!viewer) return
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const picked = viewer.scene.pick(event.position)
      if (Cesium.defined(picked) && picked.id instanceof Cesium.Entity) {
        const entity = picked.id as Cesium.Entity
        const cameraData = (entity as unknown as { _cameraData?: Camera })._cameraData
        if (cameraData) {
          selectCamera(cameraData)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handlerRef.current = handler
    return () => {
      handler.destroy()
      handlerRef.current = null
    }
  }, [viewer])

  // Update camera entities
  useEffect(() => {
    if (!viewer) return
    const existingMap = entityMapRef.current
    const updatedKeys = new Set<string>()

    if (showCameras) {
      for (const cam of cameras) {
        const key = cam.id
        updatedKeys.add(key)
        const isSelected = selectedCamera?.id === cam.id
        const position = Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 10)

        if (existingMap.has(key)) {
          const entity = existingMap.get(key)!
          if (entity.billboard) {
            entity.billboard.image = new Cesium.ConstantProperty(
              isSelected ? CAMERA_ICON_SELECTED : CAMERA_ICON,
            )
            entity.billboard.scale = new Cesium.ConstantProperty(isSelected ? 1.3 : 1.0)
          }
        } else {
          const entity = viewer.entities.add({
            position,
            billboard: {
              image: CAMERA_ICON,
              width: 28,
              height: 28,
              scale: isSelected ? 1.3 : 1.0,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000),
            },
            label: {
              text: cam.name,
              font: '10px monospace',
              fillColor: Cesium.Color.fromCssColorString('#00d4ff99'),
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 150000),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          })
          ;(entity as unknown as { _cameraData: Camera })._cameraData = cam
          existingMap.set(key, entity)
        }
      }
    }

    // Remove stale
    for (const [key, entity] of existingMap) {
      if (!updatedKeys.has(key)) {
        viewer.entities.remove(entity)
        existingMap.delete(key)
      }
    }
  }, [viewer, cameras, showCameras, selectedCamera])

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
