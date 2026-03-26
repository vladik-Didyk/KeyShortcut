import { slugToIconName, getIconData } from '../../utils/directoryHelpers'

export default function AppIcon({ slug, displayName, size = 48, className = '' }) {
  const iconName = slugToIconName[slug] || displayName
  const data = getIconData(iconName)

  if (data.type === 'image') {
    return (
      <img
        src={data.src}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 ${className}`}
        aria-hidden="true"
        loading="lazy"
      />
    )
  }

  return (
    <span
      className={`rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        backgroundColor: `#${data.hex}`,
      }}
      aria-hidden="true"
    >
      {data.label}
    </span>
  )
}
