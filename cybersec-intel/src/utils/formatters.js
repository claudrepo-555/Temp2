import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function formatTimestamp(date) {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatFullTimestamp(date) {
  return format(new Date(date), 'MMM d, yyyy HH:mm')
}

export function formatRelativeTime(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isThreadLocked(threadCreatedAt) {
  const LOCK_AFTER_MS = 72 * 60 * 60 * 1000 // 72 hours
  return Date.now() - new Date(threadCreatedAt).getTime() > LOCK_AFTER_MS
}

export function timeUntilLock(threadCreatedAt) {
  const LOCK_AFTER_MS = 72 * 60 * 60 * 1000
  const elapsed = Date.now() - new Date(threadCreatedAt).getTime()
  const remaining = LOCK_AFTER_MS - elapsed
  if (remaining <= 0) return null
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m until sealed`
  return `${minutes}m until sealed`
}

export const SEVERITY_CONFIG = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    dot: 'bg-red-500',
    ring: 'ring-red-500/40',
  },
  high: {
    label: 'HIGH',
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500/40',
  },
  medium: {
    label: 'MEDIUM',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-500',
    ring: 'ring-yellow-500/40',
  },
  low: {
    label: 'LOW',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/40',
  },
  info: {
    label: 'INFO',
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    dot: 'bg-gray-500',
    ring: 'ring-gray-500/40',
  },
}

export const SOURCE_TYPE_CONFIG = {
  advisory: { label: 'Advisory', color: 'text-red-400', bg: 'bg-red-500/10' },
  research: { label: 'Research', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  news: { label: 'News', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  blog: { label: 'Blog', color: 'text-green-400', bg: 'bg-green-500/10' },
}
