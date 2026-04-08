import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_THREADS } from '../utils/mockData'
import { fetchRecentCVEs } from '../services/nvdApi'
import { fetchCISAKEV } from '../services/cisaApi'
import { fetchAllNewsFeeds } from '../services/newsFeeds'
import { clusterItems } from '../services/intelAggregator'
import { isThreadLocked } from '../utils/formatters'

const LOCK_MS = 72 * 60 * 60 * 1000

function mergeThreadLists(mock, live) {
  // Merge live into mock, deduplicating by CVE ID
  const knownCves = new Set(
    mock.flatMap((t) => [
      ...(t.primary.cves || []),
      ...t.related.flatMap((r) => r.cves || []),
    ])
  )

  const newThreads = live.filter((t) =>
    !(t.primary.cves || []).some((c) => knownCves.has(c))
  )

  return [...mock, ...newThreads].sort((a, b) => b.createdAt - a.createdAt)
}

export const useIntelStore = create(
  persist(
    (set, get) => ({
      threads: MOCK_THREADS,
      readItems: {},
      starredItems: {},
      selectedThreadId: null,
      activeCategory: 'all',
      searchQuery: '',
      isLoading: false,
      lastFetched: null,
      dataSource: 'demo', // 'demo' | 'live' | 'mixed'

      setSelectedThread: (id) => set({ selectedThreadId: id }),
      setActiveCategory: (cat) => set({ activeCategory: cat, selectedThreadId: null }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      markRead: (itemId) =>
        set((s) => ({ readItems: { ...s.readItems, [itemId]: true } })),

      toggleStar: (itemId) =>
        set((s) => ({
          starredItems: { ...s.starredItems, [itemId]: !s.starredItems[itemId] },
        })),

      fetchLiveData: async () => {
        set({ isLoading: true })
        try {
          const [nvdItems, cisaItems, newsItems] = await Promise.all([
            fetchRecentCVEs(14, 20),
            fetchCISAKEV(15),
            fetchAllNewsFeeds(),
          ])

          const liveItems = [...nvdItems, ...cisaItems, ...newsItems]
          let dataSource = 'demo'

          if (liveItems.length > 0) {
            const liveThreads = clusterItems(liveItems)
            const merged = mergeThreadLists(MOCK_THREADS, liveThreads)
            set({ threads: merged, dataSource: 'mixed' })
            dataSource = 'mixed'
          }

          set({ isLoading: false, lastFetched: Date.now(), dataSource })
        } catch {
          set({ isLoading: false })
        }
      },

      getFilteredThreads: () => {
        const { threads, activeCategory, searchQuery, readItems, starredItems } = get()
        let filtered = threads

        if (activeCategory === 'starred') {
          filtered = filtered.filter((t) => starredItems[t.primary.id])
        } else if (activeCategory !== 'all') {
          filtered = filtered.filter((t) => t.primary.category === activeCategory)
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (t) =>
              t.primary.title.toLowerCase().includes(q) ||
              t.primary.summary.toLowerCase().includes(q) ||
              (t.primary.cves || []).some((c) => c.toLowerCase().includes(q)) ||
              (t.primary.tags || []).some((tag) => tag.toLowerCase().includes(q))
          )
        }

        return filtered.map((t) => ({
          ...t,
          primary: {
            ...t.primary,
            isRead: !!readItems[t.primary.id],
            isStarred: !!starredItems[t.primary.id],
          },
          isLocked: isThreadLocked(t.createdAt),
          timeUntilLock: LOCK_MS - (Date.now() - t.createdAt),
        }))
      },

      getSelectedThread: () => {
        const { selectedThreadId, threads, readItems, starredItems } = get()
        if (!selectedThreadId) return null
        const t = threads.find((th) => th.id === selectedThreadId)
        if (!t) return null
        return {
          ...t,
          primary: {
            ...t.primary,
            isRead: !!readItems[t.primary.id],
            isStarred: !!starredItems[t.primary.id],
          },
          isLocked: isThreadLocked(t.createdAt),
        }
      },

      getUnreadCount: (category) => {
        const { threads, readItems, starredItems } = get()
        let filtered = threads
        if (category === 'starred') filtered = threads.filter((t) => starredItems[t.primary.id])
        else if (category !== 'all') filtered = threads.filter((t) => t.primary.category === category)
        return filtered.filter((t) => !readItems[t.primary.id]).length
      },
    }),
    {
      name: 'cybersec-intel-store',
      partialize: (s) => ({ readItems: s.readItems, starredItems: s.starredItems }),
    }
  )
)
