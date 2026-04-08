import { SEVERITY_CONFIG } from '../utils/formatters'

export default function SeverityBadge({ severity, size = 'sm' }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info
  const sizeClass = size === 'xs'
    ? 'text-[9px] px-1 py-0.5'
    : size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-bold tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
