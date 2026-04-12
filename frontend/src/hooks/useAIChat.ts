import { useWorldViewStore } from '../store/worldviewStore'
import { distanceBetween } from '../lib/formatters'

export function useAIChat() {
  const store = useWorldViewStore()

  const sendMessage = async (query: string, includeCameraVision?: boolean) => {
    store.addUserMessage(query)
    store.setAIThinking(true)
    store.setActivePanel('chat')

    const { viewportCenter, flights, cameras, selectedCamera } = store

    // Build context: nearest 20 flights to viewport center
    const flightsVisible = [...flights]
      .filter((f) => f.lat != null && f.lon != null)
      .sort((a, b) =>
        distanceBetween(viewportCenter.lat, viewportCenter.lon, a.lat, a.lon) -
        distanceBetween(viewportCenter.lat, viewportCenter.lon, b.lat, b.lon),
      )
      .slice(0, 20)

    // Cameras in ~2 degree viewport window
    const cameraNames = cameras
      .filter(
        (c) =>
          Math.abs(c.lat - viewportCenter.lat) < 2 &&
          Math.abs(c.lon - viewportCenter.lon) < 3,
      )
      .map((c) => c.name)

    const body = {
      query,
      context: {
        viewport: viewportCenter,
        flights_visible: flightsVisible,
        cameras_visible: cameraNames,
        selected_camera_id: includeCameraVision && selectedCamera ? selectedCamera.id : undefined,
      },
    }

    const msgId = store.startAssistantMessage()

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok || !res.body) {
        store.appendToAssistantMessage(msgId, 'Error: Could not connect to AI service.')
        store.finalizeAssistantMessage(msgId)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim()
          if (line === '[DONE]') break
          if (!line) continue
          try {
            const parsed = JSON.parse(line)
            if (parsed.text) store.appendToAssistantMessage(msgId, parsed.text)
            if (parsed.error) store.appendToAssistantMessage(msgId, `Error: ${parsed.error}`)
          } catch {
            // malformed SSE chunk
          }
        }
      }
    } catch {
      store.appendToAssistantMessage(msgId, 'Network error. Is the backend running?')
    } finally {
      store.finalizeAssistantMessage(msgId)
      store.setAIThinking(false)
    }
  }

  return { sendMessage }
}
