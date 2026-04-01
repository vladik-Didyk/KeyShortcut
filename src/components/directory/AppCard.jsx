import { Link } from 'react-router'
import AppIcon from './AppIcon'
import { CONTENT } from '../../data/content'
import PlatformIcons from '../PlatformIcons'

export default function AppCard({ app, platform, otherPlatforms }) {
  return (
    <div className="app-card-perspective">
      <Link
        to={`/${platform}/${app.slug}`}
        className="app-card group"
        aria-label={`${app.displayName} — ${app.shortcutCount} shortcuts`}
      >
        <div className="app-card-accent" />
        <div className="w-20 h-20 flex items-center justify-center mb-4">
          <AppIcon slug={app.slug} displayName={app.displayName} size={72} />
        </div>
        <p className="font-medium text-theme-text text-[15px] text-center leading-tight">
          {app.displayName}
        </p>
        <p className="text-theme-muted text-xs mt-1.5 text-center">
          {app.shortcutCount} {CONTENT.directory.shortcutsLabel}
        </p>
        <PlatformIcons currentPlatform={platform} otherPlatforms={otherPlatforms} />
      </Link>
    </div>
  )
}
