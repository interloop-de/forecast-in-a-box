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
import { StatusCard } from '@/features/status/components/StatusCard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'card.title': 'System Status',
        'card.description': 'Current status of all services',
        'card.titleError': 'Status Error',
        'card.errorMessage': 'Could not load status',
        'card.unknownError': 'Unknown error occurred',
        'card.lastUpdated': 'Last updated',
        'services.api': 'API',
        'services.cascade': 'Cascade',
        'services.ecmwf': 'ECMWF',
        'services.scheduler': 'Scheduler',
        version: 'Version',
      }
      return translations[key] || key
    },
  }),
}))

// Mock useStatus hook
const mockUseStatus = vi.fn()
vi.mock('@/api/hooks/useStatus', () => ({
  useStatus: () => mockUseStatus(),
}))

// Mock StatusBadge
vi.mock('@/features/status/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <h2 data-testid="card-title" className={className}>
      {children}
    </h2>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('StatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows skeleton loaders when loading', async () => {
      mockUseStatus.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        dataUpdatedAt: null,
      })

      const screen = await render(<StatusCard />)
      const skeletons = screen.container.querySelectorAll(
        '[data-testid="skeleton"]',
      )
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('error state', () => {
    it('shows error card when error occurs', async () => {
      mockUseStatus.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        dataUpdatedAt: null,
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText('Status Error')).toBeVisible()
    })

    it('displays error message', async () => {
      mockUseStatus.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Connection timeout'),
        dataUpdatedAt: null,
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText('Connection timeout')).toBeVisible()
    })

    it('shows unknown error when error is not an Error instance', async () => {
      mockUseStatus.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: 'string error',
        dataUpdatedAt: null,
      })

      const screen = await render(<StatusCard />)
      await expect
        .element(screen.getByText('Unknown error occurred'))
        .toBeVisible()
    })
  })

  describe('success state', () => {
    const mockData = {
      api: 'up',
      cascade: 'up',
      ecmwf: 'down',
      scheduler: 'off',
      version: '1.0.0',
    }

    it('renders card title', async () => {
      mockUseStatus.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText('System Status')).toBeVisible()
    })

    it('renders service labels', async () => {
      mockUseStatus.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText('API')).toBeVisible()
      await expect.element(screen.getByText('Cascade')).toBeVisible()
      await expect.element(screen.getByText('ECMWF')).toBeVisible()
      await expect.element(screen.getByText('Scheduler')).toBeVisible()
    })

    it('renders status badges for each service', async () => {
      mockUseStatus.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
      })

      const screen = await render(<StatusCard />)
      const badges = screen.container.querySelectorAll(
        '[data-testid="status-badge"]',
      )
      expect(badges.length).toBe(4)
    })

    it('renders version information', async () => {
      mockUseStatus.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText('1.0.0')).toBeVisible()
    })

    it('shows last updated time', async () => {
      mockUseStatus.mockReturnValue({
        data: mockData,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: Date.now(),
      })

      const screen = await render(<StatusCard />)
      await expect.element(screen.getByText(/Last updated/)).toBeVisible()
    })
  })

  describe('no data state', () => {
    it('returns null when data is empty', async () => {
      mockUseStatus.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        dataUpdatedAt: null,
      })

      const screen = await render(<StatusCard />)
      expect(screen.container.textContent).toBe('')
    })
  })
})
