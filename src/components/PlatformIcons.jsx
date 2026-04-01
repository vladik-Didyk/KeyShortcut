/**
 * Displays small platform availability icons for an app.
 * Shows the current platform + any other platforms the app supports.
 */

const PLATFORM_META = {
  macos: { label: 'macOS', icon: AppleIcon },
  windows: { label: 'Windows', icon: WindowsIcon },
  linux: { label: 'Linux', icon: LinuxIcon },
}

const PLATFORM_ORDER = ['macos', 'windows', 'linux']

export default function PlatformIcons({ currentPlatform, otherPlatforms }) {
  const platformIds = new Set([currentPlatform])
  if (otherPlatforms) {
    for (const p of otherPlatforms) platformIds.add(p.id)
  }

  const sorted = PLATFORM_ORDER.filter(id => platformIds.has(id))
  if (sorted.length === 0) return null

  return (
    <div
      className="flex items-center justify-center gap-1.5 mt-2"
      aria-label={`Available on ${sorted.map(id => PLATFORM_META[id]?.label).join(', ')}`}
    >
      {sorted.map(id => {
        const meta = PLATFORM_META[id]
        if (!meta) return null
        const Icon = meta.icon
        return (
          <span key={id} title={meta.label} className="text-theme-muted/50">
            <Icon size={12} />
          </span>
        )
      })}
    </div>
  )
}

function AppleIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 315" fill="currentColor">
      <path d="M213.8 167.3c-.4-39.1 31.9-57.8 33.3-58.7-18.1-26.5-46.3-30.1-56.4-30.5-24-2.4-46.8 14.1-59 14.1-12.2 0-31-13.8-50.9-13.4-26.2.4-50.4 15.2-63.9 38.7-27.2 47.3-7 117.3 19.6 155.7 13 18.8 28.5 39.9 48.8 39.2 19.6-.8 27-12.7 50.7-12.7 23.7 0 30.4 12.7 51.1 12.3 21.1-.3 34.5-19.2 47.4-38.1 14.9-21.9 21.1-43 21.5-44.1-.5-.2-41.2-15.8-41.6-62.7M175 64.2c10.8-13.1 18.1-31.2 16.1-49.3-15.6.6-34.5 10.4-45.6 23.5-10 11.6-18.7 30.2-16.4 48 17.4 1.4 35.2-8.8 45.9-22.2"/>
    </svg>
  )
}

function WindowsIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
      <path d="M0 36.4l104.6-14.3V122H0zm0 183.2l104.6 14.3V134H0zm116.3 15.9L256 256V134H116.3zm0-219L256 0v122H116.3z"/>
    </svg>
  )
}

function LinuxIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 2C10 2 8.2 4.4 8.2 7c0 1.3.3 2.1-.4 3.6-.7 1.5-2.5 3-3.2 4.8-.5 1.4-.4 2.6.3 3.5.6.8 1.7 1.3 2.5 1.3.4 0 .7-.1 1.2-.3-.2.5-.3 1-.3 1.5 0 .5.4 1.1.9 1.4.5.3 1.1.2 1.6 0 .4-.2.8-.5 1.2-.5h1c.4 0 .8.3 1.2.5.5.2 1.1.3 1.6 0 .5-.3.9-.9.9-1.4 0-.5-.1-1-.3-1.5.5.2.8.3 1.2.3.8 0 1.9-.5 2.5-1.3.7-.9.8-2.1.3-3.5-.7-1.8-2.5-3.3-3.2-4.8-.7-1.5-.4-2.3-.4-3.6 0-2.6-1.8-5-4.3-5zM11 7.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5-.7 1.5-1.5 1.5S11 8.3 11 7.5z"/>
    </svg>
  )
}
