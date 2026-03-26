import { Link } from 'react-router'
import { CONTENT } from '../data/content'

export default function NotFound() {
  const { notFound } = CONTENT.shared

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-theme-text mb-2">{notFound.title}</h1>
        <p className="text-xl text-theme-muted mb-8">{notFound.subtitle}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium no-underline hover:opacity-90 transition-opacity bg-theme-accent text-theme-accent-text"
        >
          {notFound.button}
        </Link>
      </div>
    </main>
  )
}
