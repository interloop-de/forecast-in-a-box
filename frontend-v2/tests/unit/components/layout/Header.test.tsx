/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { Header } from '@/components/layout/Header'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    to: string
    onClick?: () => void
    'aria-label'?: string
  }) => (
    <a
      href={to}
      onClick={onClick}
      data-testid="router-link"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  ),
}))

// Mock useAuth hook
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockUseAuth = vi.fn()
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useMedia hook
const mockUseMedia = vi.fn()
vi.mock('@/hooks/useMedia', () => ({
  useMedia: () => mockUseMedia(),
}))

// Mock Logo component
vi.mock('@/components/common/Logo', () => ({
  Logo: () => <span data-testid="logo">Logo</span>,
}))

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    render: renderProp,
  }: {
    children?: React.ReactNode
    onClick?: () => void
    render?: React.ReactNode
  }) => (
    <button onClick={onClick} data-testid="button">
      {renderProp || children}
    </button>
  ),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      authType: 'anonymous',
      signIn: mockSignIn,
      signOut: mockSignOut,
    })
    mockUseMedia.mockReturnValue(true) // Desktop by default
  })

  describe('rendering', () => {
    it('renders header element with banner role', async () => {
      const screen = await render(<Header />)
      await expect.element(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders app title', async () => {
      const screen = await render(<Header />)
      await expect.element(screen.getByText('Forecast-in-a-Box')).toBeVisible()
    })

    it('renders logo', async () => {
      const screen = await render(<Header />)
      await expect.element(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('renders home link', async () => {
      const screen = await render(<Header />)
      const homeLink = screen.getByLabelText('home')
      await expect.element(homeLink).toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    it('renders About link on desktop', async () => {
      mockUseMedia.mockReturnValue(true) // Desktop
      const screen = await render(<Header />)
      await expect.element(screen.getByText('About')).toBeVisible()
    })
  })

  describe('mobile menu', () => {
    it('renders mobile menu button on mobile', async () => {
      mockUseMedia.mockReturnValue(false) // Mobile
      const screen = await render(<Header />)
      await expect
        .element(screen.getByLabelText('Open Menu'))
        .toBeInTheDocument()
    })

    it('toggles menu button label when clicked', async () => {
      mockUseMedia.mockReturnValue(false) // Mobile
      const screen = await render(<Header />)
      const menuButton = screen.getByLabelText('Open Menu')
      await menuButton.click()
      await expect
        .element(screen.getByLabelText('Close Menu'))
        .toBeInTheDocument()
    })
  })

  describe('authentication - anonymous mode', () => {
    it('does not show login buttons in anonymous mode', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        authType: 'anonymous',
        signIn: mockSignIn,
        signOut: mockSignOut,
      })
      const screen = await render(<Header />)
      expect(screen.container.textContent).not.toContain('Login')
      expect(screen.container.textContent).not.toContain('Get Started')
    })
  })

  describe('authentication - authenticated mode', () => {
    beforeEach(() => {
      mockUseMedia.mockReturnValue(true) // Desktop
    })

    it('shows login buttons when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        authType: 'authenticated',
        signIn: mockSignIn,
        signOut: mockSignOut,
      })
      const screen = await render(<Header />)
      await expect.element(screen.getByText('Login')).toBeVisible()
      await expect.element(screen.getByText('Get Started')).toBeVisible()
    })

    it('shows logout button when authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        authType: 'authenticated',
        signIn: mockSignIn,
        signOut: mockSignOut,
      })
      const screen = await render(<Header />)
      await expect.element(screen.getByText('Logout')).toBeVisible()
    })

    it('calls signIn when Login button is clicked', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        authType: 'authenticated',
        signIn: mockSignIn,
        signOut: mockSignOut,
      })
      const screen = await render(<Header />)
      const loginButton = screen.getByText('Login').element().closest('button')
      loginButton?.click()
      expect(mockSignIn).toHaveBeenCalled()
    })

    it('calls signOut when Logout button is clicked', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        authType: 'authenticated',
        signIn: mockSignIn,
        signOut: mockSignOut,
      })
      const screen = await render(<Header />)
      const logoutButton = screen
        .getByText('Logout')
        .element()
        .closest('button')
      logoutButton?.click()
      expect(mockSignOut).toHaveBeenCalled()
    })
  })
})
