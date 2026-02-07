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
import { WelcomeCard } from '@/features/dashboard/components/WelcomeCard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'welcome.titleAnonymous': 'Welcome!',
        'welcome.title': `Welcome, ${params?.name || 'User'}!`,
        'welcome.stats.systemStatus': 'System Status',
        'welcome.stats.checking': 'Checking...',
        'welcome.stats.loadingStatus': 'Loading status',
        'welcome.stats.allOk': 'All OK',
        'welcome.stats.operational': 'All systems operational',
        'welcome.stats.partialOutage': 'Partial Outage',
        'welcome.stats.someIssues': 'Some issues detected',
        'welcome.stats.systemDown': 'System Down',
        'welcome.stats.notOperational': 'Not operational',
        'welcome.stats.currentlyRunning': 'Currently Running',
        'welcome.stats.activeForecasts': 'Active forecasts',
        'welcome.stats.availableModels': 'Available Models',
        'welcome.stats.of': `of ${params?.total || 0}`,
        'welcome.stats.downloadedModels': 'Downloaded models',
        'welcome.stats.totalForecasts': 'Total Forecasts',
        'welcome.stats.thisMonth': 'This month',
        'welcome.actions.managePlugins': 'Manage Plugins',
        'welcome.actions.manageSources': 'Manage Sources',
        'welcome.actions.myPresets': 'My Configuration Presets',
        'welcome.actions.scheduledForecasts': 'Scheduled Forecasts',
      }
      return translations[key] || key
    },
  }),
}))

// Mock useUser hook
const mockUseUser = vi.fn()
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}))

// Mock useStatus hook
const mockUseStatus = vi.fn()
vi.mock('@/api/hooks/useStatus', () => ({
  useStatus: () => mockUseStatus(),
}))

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock StatusDetailsPopover - just render children for simpler testing
vi.mock('@/components/common/StatusDetailsPopover', () => ({
  StatusDetailsPopover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="status-popover">{children}</div>
  ),
}))

// Mock ConfigPresetsPopover - render a simple button
vi.mock('@/features/dashboard/components/ConfigPresetsPopover', () => ({
  ConfigPresetsPopover: () => <button>My Configuration Presets</button>,
}))

// Mock Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to?: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('WelcomeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock values
    mockUseUser.mockReturnValue({
      data: { email: 'john.doe@example.com' },
      isLoading: false,
      error: null,
    })
    mockUseStatus.mockReturnValue({
      trafficLightStatus: 'green',
      componentDetails: [],
      version: '1.0.0',
      refetch: vi.fn(),
      isFetching: false,
      isLoading: false,
    })
    mockUseAuth.mockReturnValue({
      authType: 'authenticated',
      isAuthenticated: true,
    })
  })

  describe('greeting', () => {
    it('shows personalized greeting in authenticated mode', async () => {
      mockUseUser.mockReturnValue({
        data: { email: 'john.doe@example.com' },
        isLoading: false,
        error: null,
      })
      mockUseAuth.mockReturnValue({
        authType: 'authenticated',
        isAuthenticated: true,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Welcome, John!')).toBeVisible()
    })

    it('shows anonymous greeting in anonymous mode', async () => {
      mockUseAuth.mockReturnValue({
        authType: 'anonymous',
        isAuthenticated: false,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Welcome!')).toBeVisible()
    })

    it('extracts first name from email correctly', async () => {
      mockUseUser.mockReturnValue({
        data: { email: 'alice.smith@company.org' },
        isLoading: false,
        error: null,
      })
      mockUseAuth.mockReturnValue({
        authType: 'authenticated',
        isAuthenticated: true,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Welcome, Alice!')).toBeVisible()
    })

    it('shows default name when email is not available', async () => {
      mockUseUser.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      })
      mockUseAuth.mockReturnValue({
        authType: 'authenticated',
        isAuthenticated: true,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Welcome, User!')).toBeVisible()
    })
  })

  describe('system status', () => {
    it('shows green status when all systems are operational', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'green',
        componentDetails: [],
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('All OK')).toBeVisible()
      await expect
        .element(screen.getByText('All systems operational'))
        .toBeVisible()
    })

    it('shows orange status when there are some issues', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'orange',
        componentDetails: [],
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Partial Outage')).toBeVisible()
      await expect
        .element(screen.getByText('Some issues detected'))
        .toBeVisible()
    })

    it('shows red status when system is down', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'red',
        componentDetails: [],
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('System Down')).toBeVisible()
      await expect.element(screen.getByText('Not operational')).toBeVisible()
    })

    it('shows unknown status while loading', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'unknown',
        componentDetails: [],
        version: undefined,
        refetch: vi.fn(),
        isFetching: false,
        isLoading: true,
      })

      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Checking...')).toBeVisible()
      await expect.element(screen.getByText('Loading status')).toBeVisible()
    })
  })

  describe('stats display', () => {
    it('shows system status stat card', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('System Status')).toBeVisible()
    })

    it('shows currently running stat card', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Currently Running')).toBeVisible()
      await expect.element(screen.getByText('Active forecasts')).toBeVisible()
    })

    it('shows available models stat card', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Available Models')).toBeVisible()
      await expect.element(screen.getByText('Downloaded models')).toBeVisible()
    })

    it('shows total forecasts stat card', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Total Forecasts')).toBeVisible()
      await expect.element(screen.getByText('This month')).toBeVisible()
    })
  })

  describe('quick actions', () => {
    it('renders manage plugins button', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Manage Plugins')).toBeVisible()
    })

    it('renders manage sources button', async () => {
      const screen = await render(<WelcomeCard />)

      await expect.element(screen.getByText('Manage Sources')).toBeVisible()
    })

    it('renders my presets button', async () => {
      const screen = await render(<WelcomeCard />)

      await expect
        .element(screen.getByText('My Configuration Presets'))
        .toBeVisible()
    })

    it('renders scheduled forecasts button', async () => {
      const screen = await render(<WelcomeCard />)

      await expect
        .element(screen.getByText('Scheduled Forecasts'))
        .toBeVisible()
    })
  })

  describe('styling', () => {
    it('accepts className prop', async () => {
      const screen = await render(<WelcomeCard className="custom-class" />)

      // Card should have the custom class
      const card = screen.container.querySelector('.custom-class')
      expect(card).not.toBeNull()
    })
  })
})
