import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, GitBranch } from 'lucide-react'
import SeverityBadge from './SeverityBadge'
import SourcePill from './SourcePill'
import { formatFullTimestamp, formatRelativeTime } from '../utils/formatters'

export default function ThreadMessage({ item, isFirst = false, totalCount }) {
  const [expanded, setExpanded] = useState(isFirst)

  return (
    <div className={`border border-gray-800 rounded-xl overflow-hidden animate-fade-in ${
      isFirst ? 'border-gray-700' : 'ml-4 border-gray-800'
    }`}>
      {/* Message header – always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
          expanded ? 'bg-gray-800/60' : 'bg-gray-900 hover:bg-gray-800/40'
        }`}
      >
        {/* Thread connector */}
        {!isFirst && (
          <div className="flex flex-col items-center mt-1 shrink-0">
            <div className="w-px h-3 bg-gray-700" />
            <div className="w-2 h-2 rounded-full bg-gray-700" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <SourcePill source={item.source} showType />
            <div className="flex items-center gap-2 shrink-0">
              <SeverityBadge severity={item.severity} size="xs" />
              <span className="text-[10px] text-gray-500">
                {formatRelativeTime(item.publishedAt)}
              </span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              )}
            </div>
          </div>

          {!isFirst && !expanded && (
            <p className="text-xs text-gray-500 line-clamp-1">{item.title}</p>
          )}

          {isFirst && !expanded && (
            <p className="text-xs text-gray-400 line-clamp-1 font-medium">{item.title}</p>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 bg-gray-900">
          {/* Title */}
          <h3 className={`font-semibold mb-3 leading-snug ${
            isFirst ? 'text-base text-gray-100' : 'text-sm text-gray-200'
          }`}>
            {item.title}
          </h3>

          {/* CVE pills */}
          {(item.cves || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.cves.map((cve) => (
                <span
                  key={cve}
                  className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded"
                >
                  {cve}
                </span>
              ))}
            </div>
          )}

          {/* Differences banner (for related items) */}
          {!isFirst && item.differences && (
            <div className="flex gap-2 p-3 mb-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <GitBranch className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  What's different
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed">{item.differences}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{item.summary}</p>

          {/* Tags */}
          {(item.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <span className="text-[10px] text-gray-600">
              {formatFullTimestamp(item.publishedAt)}
            </span>
            {item.source.url && item.source.url !== '#' && (
              <a
                href={item.source.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                View source <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
