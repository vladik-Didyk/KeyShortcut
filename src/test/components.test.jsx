import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import NotFound from '../components/NotFound'
import ErrorBoundary from '../components/ErrorBoundary'
import Footer from '../components/Footer'
import MacAppStoreButton from '../components/MacAppStoreButton'
import AdSlot from '../components/AdSlot'

describe('NotFound', () => {
  it('renders 404 and a link to /', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})

describe('ErrorBoundary', () => {
  it('catches errors and shows fallback UI', () => {
    function Thrower() {
      throw new Error('boom')
    }
    // Suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    spy.mockRestore()
  })
})

describe('Footer', () => {
  it('renders universal links with correct paths', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /macos shortcuts/i })).toHaveAttribute('href', '/macos')
    expect(screen.getByRole('link', { name: /mac hud app/i })).toHaveAttribute('href', '/mac-hud')
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy')
  })

  it('renders same links regardless of current route', () => {
    render(
      <MemoryRouter initialEntries={['/macos/safari']}>
        <Footer />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /macos shortcuts/i })).toHaveAttribute('href', '/macos')
    expect(screen.getByRole('link', { name: /mac hud app/i })).toHaveAttribute('href', '/mac-hud')
  })
})

describe('MacAppStoreButton', () => {
  it('renders with default href containing apps.apple.com', () => {
    render(<MacAppStoreButton />)
    const link = screen.getByRole('link', { name: /mac app store/i })
    expect(link.getAttribute('href')).toContain('apps.apple.com')
  })
})

describe('AdSlot', () => {
  it('renders nothing in non-production environment', () => {
    // AdSense ad units only render in production to avoid empty "Sponsored" placeholders
    const { container } = render(<AdSlot adSlot="1234567890" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders sponsor content when sponsor prop is provided', () => {
    const sponsor = { url: 'https://example.com', image: '/sponsor.png', alt: 'Test Sponsor' }
    const { container } = render(<AdSlot adSlot="1234567890" sponsor={sponsor} />)
    expect(container.innerHTML).toContain('example.com')
    expect(container.innerHTML).toContain('Sponsored')
  })
})
