import { Component } from 'react'
import { CONTENT } from '../data/content'

export default class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  render() {
    if (this.state.hasError) {
      const { errorBoundary } = CONTENT.shared

      return (
        <div className="min-h-[70vh] flex items-center justify-center px-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-theme-text mb-2">{errorBoundary.title}</h1>
            <p className="text-theme-muted mb-8">{errorBoundary.subtitle}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium cursor-pointer border-none transition-opacity hover:opacity-90 bg-theme-accent text-theme-accent-text"
              >
                {errorBoundary.retryButton}
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium no-underline hover:opacity-90 transition-opacity border border-theme-border text-theme-text"
              >
                {errorBoundary.button}
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
