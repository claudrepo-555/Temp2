import { SOURCE_TYPE_CONFIG } from '../utils/formatters'

const SOURCE_INITIALS = (name) =>
  name
    .split(/[\s/]+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)

const SOURCE_COLORS = [
  'bg-blue-600', 'bg-purple-600', 'bg-green-700', 'bg-orange-600',
  'bg-teal-600', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-700',
]

function colorForSource(name) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return SOURCE_COLORS[hash % SOURCE_COLORS.length]
}

export default function SourcePill({ source, showType = false }) {
  const cfg = SOURCE_TYPE_CONFIG[source.type] || SOURCE_TYPE_CONFIG.news
  const color = colorForSource(source.name)
  const initials = SOURCE_INITIALS(source.name)

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold text-white ${color}`}
      >
        {initials}
      </span>
      <span className="text-xs text-gray-400">{source.name}</span>
      {showType && (
        <span className={`text-[9px] font-semibold uppercase px-1 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      )}
    </span>
  )
}
