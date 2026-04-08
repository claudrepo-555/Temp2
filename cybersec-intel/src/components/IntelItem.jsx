import { Star, MessageSquare, Lock } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import SourcePill from './SourcePill'
import { formatTimestamp, SEVERITY_CONFIG } from '../utils/formatters'
import { useIntelStore } from '../store/useIntelStore'

export default function IntelItem({ thread, isSelected }) {
  const { primary, related, isLocked } = thread
  const setSelectedThread = useIntelStore((s) => s.setSelectedThread)
  const markRead = useIntelStore((s) => s.markRead)
  const toggleStar = useIntelStore((s) => s.toggleStar)
  const severityCfg = SEVERITY_CONFIG[primary.severity] || SEVERITY_CONFIG.info

  function handleClick() {
    setSelectedThread(thread.id)
    markRead(primary.id)
  }

  function handleStar(e) {
    e.stopPropagation()
    toggleStar(primary.id)
  }

  const isUnread = !primary.isRead
  const hasRelated = related.length > 0

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col px-4 py-3 cursor-pointer border-b border-gray-800 transition-colors ${
        isSelected
          ? 'bg-blue-600/10 border-l-2 border-l-blue-500'
          : isUnread
          ? 'bg-gray-800/50 hover:bg-gray-800'
          : 'hover:bg-gray-900'
      }`}
    >
      {/* Severity left bar */}
      {!isSelected && (
        <span
          className={`absolute left-0 top-0 bottom-0 w-0.5 ${severityCfg.dot} opacity-60`}
        />
      )}

      {/* Row 1: Source + time + star */}
      <div className="flex items-center justify-between mb-1">
        <SourcePill source={primary.source} />
        <div className="flex items-center gap-2 shrink-0">
          {isLocked && (
            <Lock className="w-3 h-3 text-gray-600" title="Thread sealed (72h+)" />
          )}
          {hasRelated && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <MessageSquare className="w-3 h-3" />
              {related.length + 1}
            </span>
          )}
          <span className={`text-[10px] ${isUnread ? 'text-gray-300 font-semibold' : 'text-gray-600'}`}>
            {formatTimestamp(primary.publishedAt)}
          </span>
          <button
            onClick={handleStar}
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
              primary.isStarred ? '!opacity-100' : ''
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 transition-colors ${
                primary.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Row 2: Title */}
      <div className={`text-sm leading-snug mb-1 line-clamp-2 ${isUnread ? 'font-semibold text-gray-100' : 'font-medium text-gray-300'}`}>
        {primary.title}
      </div>

      {/* Row 3: Summary preview */}
      <div className="text-xs text-gray-500 line-clamp-1 mb-2">
        {primary.summary}
      </div>

      {/* Row 4: Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <SeverityBadge severity={primary.severity} size="xs" />
        {primary.category && (
          <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
            {primary.category}
          </span>
        )}
        {(primary.cves || []).slice(0, 1).map((cve) => (
          <span key={cve} className="text-[10px] font-mono bg-gray-800/80 text-blue-400 px-1.5 py-0.5 rounded border border-gray-700">
            {cve}
          </span>
        ))}
        {(primary.cves || []).length > 1 && (
          <span className="text-[10px] text-gray-600">+{primary.cves.length - 1}</span>
        )}
      </div>
    </div>
  )
}
