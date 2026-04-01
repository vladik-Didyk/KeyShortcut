import { CircleCheck } from '../utils/icons'

/**
 * Shows when shortcuts were last verified against official docs.
 *
 * Variants:
 *   "inline"  — compact, for headers/metadata lines (default)
 *   "block"   — full line with docs link, for intro areas
 *   "mini"    — icon + relative date only, for app cards
 */
export default function LastCheckedBadge({ date, docsUrl, variant = 'inline' }) {
  if (!date) return null

  const d = new Date(date)
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const long = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  if (variant === 'mini') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-theme-muted"
        title={`Verified against official docs on ${long}`}
      >
        <CircleCheck size={10} className="text-green-600 shrink-0" />
        {formatted}
      </span>
    )
  }

  if (variant === 'block') {
    return (
      <p className="text-theme-muted text-xs mt-2 flex items-center gap-1.5">
        <CircleCheck size={12} className="text-green-600 shrink-0" />
        Last checked against{' '}
        {docsUrl ? (
          <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline no-underline">official docs</a>
        ) : (
          'official docs'
        )}
        {' '}on {long}
      </p>
    )
  }

  // variant === 'inline'
  return (
    <span
      className="ml-2 pl-2 border-l border-theme-border/40 inline-flex items-center gap-1"
      title={`Verified against official docs on ${long}`}
    >
      <CircleCheck size={11} className="text-green-600" />
      Checked {formatted}
    </span>
  )
}
