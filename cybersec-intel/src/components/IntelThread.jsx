import { Star, Lock, Clock, ArrowLeft, Share2, ChevronRight } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import ThreadMessage from './ThreadMessage'
import { useIntelStore } from '../store/useIntelStore'
import { formatFullTimestamp, timeUntilLock, SEVERITY_CONFIG } from '../utils/formatters'

export default function IntelThread() {
  const getSelectedThread = useIntelStore((s) => s.getSelectedThread)
  const toggleStar = useIntelStore((s) => s.toggleStar)
  const setSelectedThread = useIntelStore((s) => s.setSelectedThread)
  const thread = getSelectedThread()

  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-gray-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
            <Share2 className="w-7 h-7 text-gray-700" />
          </div>
          <p className="text-sm font-medium text-gray-600">Select an intel item to read</p>
          <p className="text-xs text-gray-700">Threats, CVEs, and chained related reports</p>
        </div>
      </div>
    )
  }

  const { primary, related, isLocked, createdAt } = thread
  const lockCountdown = timeUntilLock(createdAt)
  const severityCfg = SEVERITY_CONFIG[primary.severity] || SEVERITY_CONFIG.info
  const allMessages = [primary, ...related]

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden h-full animate-fade-in">
      {/* Thread toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedThread(null)}
            className="md:hidden p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={primary.severity} size="sm" />
            {primary.category && (
              <>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-400">{primary.category}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Lock status */}
          {isLocked ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              Thread sealed
            </div>
          ) : lockCountdown ? (
            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/5 border border-green-500/20 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              {lockCountdown}
            </div>
          ) : null}

          {/* Star */}
          <button
            onClick={() => toggleStar(primary.id)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                primary.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Thread header */}
      <div className={`px-6 py-4 border-b border-gray-800 shrink-0 bg-gradient-to-r from-gray-900 to-gray-950`}>
        <div className={`h-px w-full mb-4 bg-gradient-to-r ${severityCfg.dot.replace('bg-', 'from-')} to-transparent opacity-60`} />
        <h1 className="text-lg font-bold text-gray-100 leading-snug mb-3">
          {primary.title}
        </h1>

        {/* CVEs */}
        {(primary.cves || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {primary.cves.map((cve) => (
              <span
                key={cve}
                className="text-sm font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg"
              >
                {cve}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{formatFullTimestamp(primary.publishedAt)}</span>
          <span>·</span>
          <span>{allMessages.length} source{allMessages.length !== 1 ? 's' : ''}</span>
          {related.length > 0 && (
            <>
              <span>·</span>
              <span>{related.length} related report{related.length !== 1 ? 's' : ''}</span>
            </>
          )}
          {isLocked && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-gray-600">
                <Lock className="w-3 h-3" /> Immutable thread
              </span>
            </>
          )}
        </div>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {allMessages.map((msg, idx) => (
          <ThreadMessage
            key={msg.id}
            item={msg}
            isFirst={idx === 0}
            totalCount={allMessages.length}
          />
        ))}

        {/* Sealed notice */}
        {isLocked && (
          <div className="flex items-center gap-3 p-4 border border-dashed border-gray-700 rounded-xl text-center justify-center">
            <Lock className="w-4 h-4 text-gray-600 shrink-0" />
            <p className="text-xs text-gray-600">
              This thread was sealed 72 hours after creation. No new reports can be added.
              New coverage of this topic will appear in a separate thread.
            </p>
          </div>
        )}

        {related.length === 0 && !isLocked && (
          <div className="flex items-center gap-3 p-4 border border-dashed border-gray-800 rounded-xl">
            <Clock className="w-4 h-4 text-gray-700 shrink-0" />
            <p className="text-xs text-gray-600">
              No related reports yet. Additional coverage will be chained here automatically within 72 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
