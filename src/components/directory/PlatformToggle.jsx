export default function PlatformToggle({ platforms, activePlatform, onSelect }) {
  if (!platforms) return null

  return (
    <div className="inline-flex rounded-xl overflow-hidden border border-theme-border">
      {platforms.map(p => {
        const isActive = p.id === activePlatform

        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all cursor-pointer border-none ${
              isActive
                ? 'bg-theme-accent text-theme-base'
                : 'bg-theme-base-alt text-theme-muted'
            }`}
          >
            {p.icon && (
              <img
                src={`/images/platform-icons/${p.icon.replace('.png', '.webp')}`}
                alt=""
                width={16}
                height={16}
                className="shrink-0"
                aria-hidden="true"
              />
            )}
            {p.displayName}
          </button>
        )
      })}
    </div>
  )
}
