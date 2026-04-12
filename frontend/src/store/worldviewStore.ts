import { create } from 'zustand'
import type { Flight } from '../types/flight'
import type { Camera } from '../types/camera'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  timestamp: number
}

interface WorldViewStore {
  // Map/globe state
  viewportCenter: { lat: number; lon: number; zoom: number }
  setViewportCenter: (center: { lat: number; lon: number; zoom: number }) => void

  // Layer visibility
  showFlights: boolean
  showCameras: boolean
  toggleFlights: () => void
  toggleCameras: () => void

  // Flight data
  flights: Flight[]
  selectedFlight: Flight | null
  flightLoadTime: number
  setFlights: (flights: Flight[], time: number) => void
  selectFlight: (flight: Flight | null) => void

  // Camera data
  cameras: Camera[]
  selectedCamera: Camera | null
  setCameras: (cameras: Camera[]) => void
  selectCamera: (camera: Camera | null) => void

  // AI panel
  activePanel: 'chat' | 'layers'
  setActivePanel: (panel: 'chat' | 'layers') => void
  chatMessages: ChatMessage[]
  isAIThinking: boolean
  addUserMessage: (content: string) => void
  startAssistantMessage: () => string
  appendToAssistantMessage: (id: string, text: string) => void
  finalizeAssistantMessage: (id: string) => void
  setAIThinking: (thinking: boolean) => void
}

export const useWorldViewStore = create<WorldViewStore>((set) => ({
  viewportCenter: { lat: 30.2672, lon: -97.7431, zoom: 9 },
  setViewportCenter: (center) => set({ viewportCenter: center }),

  showFlights: true,
  showCameras: true,
  toggleFlights: () => set((s) => ({ showFlights: !s.showFlights })),
  toggleCameras: () => set((s) => ({ showCameras: !s.showCameras })),

  flights: [],
  selectedFlight: null,
  flightLoadTime: 0,
  setFlights: (flights, time) => set({ flights, flightLoadTime: time }),
  selectFlight: (flight) => set({ selectedFlight: flight, selectedCamera: null }),

  cameras: [],
  selectedCamera: null,
  setCameras: (cameras) => set({ cameras }),
  selectCamera: (camera) => set({ selectedCamera: camera, selectedFlight: null }),

  activePanel: 'chat',
  setActivePanel: (panel) => set({ activePanel: panel }),
  chatMessages: [],
  isAIThinking: false,

  addUserMessage: (content) =>
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() },
      ],
    })),

  startAssistantMessage: () => {
    const id = crypto.randomUUID()
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        { id, role: 'assistant', content: '', streaming: true, timestamp: Date.now() },
      ],
    }))
    return id
  },

  appendToAssistantMessage: (id, text) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, content: m.content + text } : m,
      ),
    })),

  finalizeAssistantMessage: (id) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, streaming: false } : m,
      ),
    })),

  setAIThinking: (thinking) => set({ isAIThinking: thinking }),
}))
