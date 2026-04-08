import { Search, X, Filter } from 'lucide-react'
import { useIntelStore } from '../store/useIntelStore'
import IntelItem from './IntelItem'

export default function IntelList() {
  const getFilteredThreads = useIntelStore((s) => s.getFilteredThreads)
  const selectedThreadId = useIntelStore((s) => s.selectedThreadId)
  const searchQuery = useIntelStore((s) => s.searchQuery)
  const setSearchQuery = useIntelStore((s) => s.setSearchQuery)
  const activeCategory = useIntelStore((s) => s.activeCategory)
  const threads = getFilteredThreads()

  const categoryLabel = {
    all: 'All Intel',
    starred: 'Starred',
    'Zero-Day': 'Zero-Days',
    Ransomware: 'Ransomware',
    APT: 'APT / Nation-State',
    'Supply Chain': 'Supply Chain',
    'Patch Tuesday': 'Patch Tuesday',
  }[activeCategory] || activeCategory

  return (
    <div className="flex flex-col w-80 shrink-0 border-r border-gray-800 bg-gray-950 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-200">{categoryLabel}</h2>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            {threads.length}
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search intel, CVEs, tags…"
            className="w-full pl-8 pr-7 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600">
            <Filter className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No intel found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          threads.map((thread) => (
            <IntelItem
              key={thread.id}
              thread={thread}
              isSelected={selectedThreadId === thread.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
