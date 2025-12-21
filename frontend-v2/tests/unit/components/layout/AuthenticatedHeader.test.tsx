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
import type { User } from '@/types/user.types'
import { AuthenticatedHeader } from '@/components/layout/AuthenticatedHeader'

// Mock state
let mockUser: User | null = null
let mockTrafficLightStatus: 'green' | 'orange' | 'red' | 'unknown' = 'green'
let mockAuthType: 'authenticated' | 'anonymous' = 'authenticated'
let mockSignOut = vi.fn()
let mockTheme: 'light' | 'dark' | 'system' = 'light'
let mockSetTheme = vi.fn()
let mockIsSidebarOpen = true
let mockToggleSidebar = vi.fn()
let mockLayoutMode: 'fluid' | 'boxed' = 'fluid'
let mockSetLayoutMode = vi.fn()
let mockDashboardVariant: 'default' | 'flat' | 'modern' | 'gradient' = 'default'
let mockSetDashboardVariant = vi.fn()

// Mock useUser
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: mockUser,
    isLoading: false,
  }),
}))

// Mock useStatus
vi.mock('@/api/hooks/useStatus', () => ({
  useStatus: () => ({
    trafficLightStatus: mockTrafficLightStatus,
  }),
}))

// Mock useAuth
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    authType: mockAuthType,
    signOut: mockSignOut,
  }),
}))

// Mock useUiStore
vi.mock('@/stores/uiStore', () => ({
  useUiStore: (
    selector: (state: {
      theme: string
      setTheme: typeof mockSetTheme
      isSidebarOpen: boolean
      toggleSidebar: typeof mockToggleSidebar
      layoutMode: string
      setLayoutMode: typeof mockSetLayoutMode
      dashboardVariant: string
      setDashboardVariant: typeof mockSetDashboardVariant
    }) => unknown,
  ) => {
    const state = {
      theme: mockTheme,
      setTheme: mockSetTheme,
      isSidebarOpen: mockIsSidebarOpen,
      toggleSidebar: mockToggleSidebar,
      layoutMode: mockLayoutMode,
      setLayoutMode: mockSetLayoutMode,
      dashboardVariant: mockDashboardVariant,
      setDashboardVariant: mockSetDashboardVariant,
    }
    return selector(state)
  },
}))

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    to: string
    className?: string
    'aria-label'?: string
  }) => (
    <a
      href={to}
      className={className}
      aria-label={ariaLabel}
      data-testid={`link-${to.replace('/', '').replace(/\//g, '-') || 'home'}`}
    >
      {children}
    </a>
  ),
}))

// Mock Logo component
vi.mock('@/components/common/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

// Mock StatusDetailsPopover
vi.mock('@/components/common/StatusDetailsPopover', () => ({
  StatusDetailsPopover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="status-popover">{children}</div>
  ),
}))

// Mock StatusIndicator
vi.mock('@/components/common/StatusIndicator', () => ({
  StatusIndicator: ({
    status,
    showLabel,
  }: {
    status: string
    variant?: string
    size?: string
    showPulse?: boolean
    showLabel?: boolean
  }) => (
    <div
      data-testid="status-indicator"
      data-status={status}
      data-show-label={showLabel}
    >
      Status: {status}
    </div>
  ),
}))

describe('AuthenticatedHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      is_active: true,
      is_superuser: false,
      is_verified: true,
    }
    mockTrafficLightStatus = 'green'
    mockAuthType = 'authenticated'
    mockSignOut = vi.fn()
    mockTheme = 'light'
    mockSetTheme = vi.fn()
    mockIsSidebarOpen = true
    mockToggleSidebar = vi.fn()
    mockLayoutMode = 'fluid'
    mockSetLayoutMode = vi.fn()
    mockDashboardVariant = 'default'
    mockSetDashboardVariant = vi.fn()
  })

  describe('rendering', () => {
    it('renders header element', async () => {
      const screen = await render(<AuthenticatedHeader />)

      const header = screen.container.querySelector('header')
      expect(header).toBeTruthy()
    })

    it('renders logo with link to dashboard', async () => {
      const screen = await render(<AuthenticatedHeader />)

      await expect.element(screen.getByTestId('logo')).toBeVisible()
      await expect.element(screen.getByTestId('link-dashboard')).toBeVisible()
    })

    it('renders application title', async () => {
      const screen = await render(<AuthenticatedHeader />)

      await expect.element(screen.getByText('Forecast-in-a-Box')).toBeVisible()
    })

    it('renders help button', async () => {
      const screen = await render(<AuthenticatedHeader />)

      const helpButton = screen.getByRole('button', { name: 'Help' })
      await expect.element(helpButton).toBeVisible()
    })

    it('renders settings button', async () => {
      const screen = await render(<AuthenticatedHeader />)

      const settingsButton = screen.getByRole('button', { name: 'Settings' })
      await expect.element(settingsButton).toBeVisible()
    })
  })

  describe('status indicator', () => {
    it('renders status indicator with current status', async () => {
      mockTrafficLightStatus = 'green'

      const screen = await render(<AuthenticatedHeader />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator.element()).toHaveAttribute('data-status', 'green')
    })

    it('shows label when status is not green', async () => {
      mockTrafficLightStatus = 'orange'

      const screen = await render(<AuthenticatedHeader />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator.element()).toHaveAttribute(
        'data-show-label',
        'true',
      )
    })

    it('hides label when status is green', async () => {
      mockTrafficLightStatus = 'green'

      const screen = await render(<AuthenticatedHeader />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator.element()).toHaveAttribute(
        'data-show-label',
        'false',
      )
    })

    it('displays red status', async () => {
      mockTrafficLightStatus = 'red'

      const screen = await render(<AuthenticatedHeader />)

      const statusIndicator = screen.getByTestId('status-indicator')
      expect(statusIndicator.element()).toHaveAttribute('data-status', 'red')
    })
  })

  describe('authenticated user', () => {
    it('identifies as authenticated when authType is authenticated', async () => {
      mockAuthType = 'authenticated'

      const screen = await render(<AuthenticatedHeader />)

      // Component should render with authenticated header
      await expect.element(screen.getByTestId('link-dashboard')).toBeVisible()
    })
  })

  describe('anonymous mode', () => {
    it('works in anonymous mode', async () => {
      mockAuthType = 'anonymous'
      mockUser = {
        id: 'anon-user',
        email: 'anonymous@example.com',
        is_active: true,
        is_superuser: false,
        is_verified: true,
      }

      const screen = await render(<AuthenticatedHeader />)

      // Should still render the header
      await expect.element(screen.getByTestId('link-dashboard')).toBeVisible()
    })
  })

  describe('superuser', () => {
    it('identifies superuser correctly', async () => {
      mockUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        is_active: true,
        is_superuser: true,
        is_verified: true,
      }

      const screen = await render(<AuthenticatedHeader />)

      // Should render header for superuser
      await expect.element(screen.getByTestId('link-dashboard')).toBeVisible()
    })
  })

  describe('layout mode', () => {
    it('applies fluid layout by default', async () => {
      mockLayoutMode = 'fluid'

      const screen = await render(<AuthenticatedHeader />)

      const header = screen.container.querySelector('header')
      expect(header).toBeTruthy()
      // Fluid layout should not have max-w-7xl class
      const innerDiv = header?.querySelector('div')
      expect(innerDiv?.classList.contains('max-w-7xl')).toBe(false)
    })

    it('applies boxed layout when layoutMode is boxed', async () => {
      mockLayoutMode = 'boxed'

      const screen = await render(<AuthenticatedHeader />)

      const header = screen.container.querySelector('header')
      const innerDiv = header?.querySelector('div')
      expect(innerDiv?.classList.contains('max-w-7xl')).toBe(true)
    })
  })

  describe('status popover', () => {
    it('renders status popover wrapper', async () => {
      const screen = await render(<AuthenticatedHeader />)

      await expect.element(screen.getByTestId('status-popover')).toBeVisible()
    })
  })
})
