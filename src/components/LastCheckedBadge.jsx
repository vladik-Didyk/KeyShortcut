import { CircleCheck } from '../utils/icons'

function formatDate(date, style = 'short') {
  const d = new Date(date)
  return style === 'long'
    ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Shows when shortcuts were last verified/updated.
 *
 * Variants:
 *   "inline"  — compact, for headers/metadata lines (default)
 *   "block"   — full line with docs link + updated date, for intro areas
 *   "mini"    — icon + relative date only, for app cards
 */
export default function LastCheckedBadge({ date, updatedDate, docsUrl, variant = 'inline' }) {
  if (!date) return null

  const formatted = formatDate(date)
  const long = formatDate(date, 'long')

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
    const updatedLong = updatedDate ? formatDate(updatedDate, 'long') : null
    const showUpdated = updatedDate && updatedDate !== date

    return (
      <div className="text-theme-muted text-xs mt-2 space-y-1">
        <p className="flex items-center gap-1.5">
          <CircleCheck size={12} className="text-green-600 shrink-0" />
          Last checked against{' '}
          {docsUrl ? (
            <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline no-underline">official docs</a>
          ) : (
            'official docs'
          )}
          {' '}on {long}
        </p>
        {showUpdated && (
          <p className="flex items-center gap-1.5 pl-[18px]">
            Shortcuts last updated on {updatedLong}
          </p>
        )}
      </div>
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
