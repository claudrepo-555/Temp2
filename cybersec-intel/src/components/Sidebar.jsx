import {
  Inbox, Star, Zap, Lock, Globe, Package, ShieldCheck,
  RefreshCw, Wifi, WifiOff, AlertCircle
} from 'lucide-react'
import { useIntelStore } from '../store/useIntelStore'

const ICON_MAP = {
  inbox: Inbox, star: Star, zap: Zap, lock: Lock,
  globe: Globe, package: Package, 'shield-check': ShieldCheck,
}

const NAV_ITEMS = [
  { id: 'all', label: 'All Intel', icon: 'inbox' },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'Zero-Day', label: 'Zero-Days', icon: 'zap' },
  { id: 'Ransomware', label: 'Ransomware', icon: 'lock' },
  { id: 'APT', label: 'APT / Nation-State', icon: 'globe' },
  { id: 'Supply Chain', label: 'Supply Chain', icon: 'package' },
  { id: 'Patch Tuesday', label: 'Patch Tuesday', icon: 'shield-check' },
]

const SEVERITY_STATS = [
  { key: 'critical', label: 'Critical', color: 'bg-red-500' },
  { key: 'high', label: 'High', color: 'bg-orange-500' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-500' },
]

export default function Sidebar() {
  const activeCategory = useIntelStore((s) => s.activeCategory)
  const setActiveCategory = useIntelStore((s) => s.setActiveCategory)
  const getUnreadCount = useIntelStore((s) => s.getUnreadCount)
  const fetchLiveData = useIntelStore((s) => s.fetchLiveData)
  const isLoading = useIntelStore((s) => s.isLoading)
  const dataSource = useIntelStore((s) => s.dataSource)
  const lastFetched = useIntelStore((s) => s.lastFetched)
  const threads = useIntelStore((s) => s.threads)

  const severityCount = (sev) =>
    threads.filter((t) => t.primary.severity === sev).length

  return (
    <aside className="flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800 h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">ThreatIntel</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">OSINT Dashboard</div>
          </div>
        </div>
      </div>

      {/* Refresh */}
      <div className="px-3 pt-3">
        <button
          onClick={fetchLiveData}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching…' : 'Refresh Intel'}
        </button>
      </div>

      {/* Data source status */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          {dataSource === 'mixed' ? (
            <><Wifi className="w-3 h-3 text-green-500" /> Live + Demo data</>
          ) : (
            <><WifiOff className="w-3 h-3 text-gray-600" /> Demo data only</>
          )}
        </div>
        {lastFetched && (
          <div className="text-[10px] text-gray-600 mt-0.5">
            Updated {new Date(lastFetched).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2 py-1">
          Feeds
        </div>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const Icon = ICON_MAP[icon]
          const count = getUnreadCount(id)
          const active = activeCategory === id
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-700 text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        {/* Severity breakdown */}
        <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-2 py-1 mt-3">
          Severity
        </div>
        {SEVERITY_STATS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between px-3 py-1.5">
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </span>
            <span className="text-xs font-mono text-gray-500">{severityCount(key)}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="text-[10px] text-gray-600 leading-relaxed">
          Sources: NVD · CISA KEV · THN · BleepingComputer · Krebs · Dark Reading
        </div>
      </div>
    </aside>
  )
}
