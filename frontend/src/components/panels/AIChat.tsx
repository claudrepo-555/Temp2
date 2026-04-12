import { useState, useRef, useEffect } from 'react'
import { useWorldViewStore } from '../../store/worldviewStore'
import { useAIChat } from '../../hooks/useAIChat'

const QUICK_ACTIONS = [
  { label: 'Analyze visible flights', prompt: 'Analyze all the flights currently visible on the map. What patterns do you see? Any unusual activity?' },
  { label: 'Summarize traffic', prompt: 'Summarize the current traffic situation in Austin based on the available camera data.' },
  { label: "What's happening here?", prompt: "Give me a situational awareness brief for the current viewport. What's notable about the flights and ground activity?" },
  { label: 'Airspace density', prompt: 'Assess the current airspace density over Texas. How busy is it compared to typical levels?' },
]

export function AIChat() {
  const { chatMessages, isAIThinking, flights, cameras, viewportCenter } = useWorldViewStore()
  const { sendMessage } = useAIChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isAIThinking) return
    setInput('')
    sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Count flights near viewport
  const nearbyFlights = flights.filter(
    (f) =>
      Math.abs(f.lat - viewportCenter.lat) < 5 &&
      Math.abs(f.lon - viewportCenter.lon) < 7,
  ).length

  const nearbyCameras = cameras.filter(
    (c) =>
      Math.abs(c.lat - viewportCenter.lat) < 2 &&
      Math.abs(c.lon - viewportCenter.lon) < 3,
  ).length

  return (
    <div className="flex flex-col h-full">
      {/* Context indicator */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[#00d4ff10] text-[10px] font-mono text-[#5a7a9f]">
        <span className="flex items-center gap-1">
          <span className="text-[#00d4ff]">✈</span> {nearbyFlights} flights
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[#00d4ff]">📷</span> {nearbyCameras} cameras
        </span>
        <span className="ml-auto flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isAIThinking ? 'bg-[#00ff88] animate-pulse' : 'bg-[#00d4ff]'}`} />
          {isAIThinking ? 'analyzing...' : 'ready'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {chatMessages.length === 0 && (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">🌐</div>
            <p className="text-xs font-mono text-[#5a7a9f] mb-4">
              WorldView Intelligence ready
            </p>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isAIThinking}
                  className="w-full text-left text-xs font-mono px-3 py-2 rounded border border-[#00d4ff22] text-[#5a7a9f] hover:border-[#00d4ff55] hover:text-[#00d4ff] hover:bg-[#00d4ff08] transition-colors disabled:opacity-50"
                >
                  {action.label} →
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00d4ff22] border border-[#00d4ff44] flex items-center justify-center mr-2 mt-0.5">
                <span className="text-[8px] text-[#00d4ff]">AI</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded px-3 py-2 text-xs font-mono leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#00d4ff15] border border-[#00d4ff33] text-[#e8eef7]'
                  : 'bg-[#141d35] border border-[#00d4ff15] text-[#e8eef7]'
              } ${msg.streaming ? 'streaming-cursor' : ''}`}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {msg.content || (msg.streaming ? '' : '...')}
            </div>
          </div>
        ))}

        {isAIThinking && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00d4ff22] border border-[#00d4ff44] flex items-center justify-center mr-2">
              <span className="text-[8px] text-[#00d4ff]">AI</span>
            </div>
            <div className="bg-[#141d35] border border-[#00d4ff15] rounded px-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions (shown when there are messages) */}
      {chatMessages.length > 0 && (
        <div className="px-3 py-2 border-t border-[#00d4ff10] flex gap-1.5 overflow-x-auto">
          {QUICK_ACTIONS.slice(0, 2).map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.prompt)}
              disabled={isAIThinking}
              className="flex-shrink-0 text-[10px] font-mono px-2 py-1 rounded border border-[#00d4ff22] text-[#5a7a9f] hover:border-[#00d4ff44] hover:text-[#00d4ff] transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-[#00d4ff15]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Query the intelligence system..."
            disabled={isAIThinking}
            rows={2}
            className="flex-1 bg-[#0a0e1a] border border-[#00d4ff33] rounded px-3 py-2 text-xs font-mono text-[#e8eef7] placeholder-[#5a7a9f] resize-none focus:outline-none focus:border-[#00d4ff] transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isAIThinking}
            className="px-3 py-2 rounded border border-[#00d4ff55] bg-[#00d4ff11] text-[#00d4ff] hover:bg-[#00d4ff22] hover:border-[#00d4ff] transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono text-xs"
          >
            ⏎
          </button>
        </div>
      </div>
    </div>
  )
}
