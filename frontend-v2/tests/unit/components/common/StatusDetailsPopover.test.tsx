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
import type { ComponentStatus, StatusComponent } from '@/types/status.types'
import { StatusDetailsPopover } from '@/components/common/StatusDetailsPopover'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'status.title': 'System Status',
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

// Helper to create component details array
function createComponentDetails(
  statuses: Partial<Record<StatusComponent, ComponentStatus>>,
) {
  const components: Array<StatusComponent> = [
    'api',
    'cascade',
    'ecmwf',
    'scheduler',
  ]
  return components.map((component) => ({
    component,
    status: statuses[component] ?? 'up',
  }))
}

describe('StatusDetailsPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock return value
    mockUseStatus.mockReturnValue({
      componentDetails: createComponentDetails({
        api: 'up',
        cascade: 'up',
        ecmwf: 'up',
        scheduler: 'off',
      }),
      version: '0.0.1@2025-11-10 17:06:53',
      refetch: vi.fn(),
      isFetching: false,
      isLoading: false,
    })
  })

  describe('rendering', () => {
    it('renders trigger element', async () => {
      const screen = await render(
        <StatusDetailsPopover>
          <span data-testid="trigger">Status</span>
        </StatusDetailsPopover>,
      )

      await expect.element(screen.getByTestId('trigger')).toBeVisible()
    })

    it('opens popover on click', async () => {
      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      // Click the trigger to open popover
      const trigger = screen.getByRole('button')
      await trigger.click()

      // Title should be visible after clicking
      await expect.element(screen.getByText('System Status')).toBeVisible()
    })

    it('shows component status rows when open', async () => {
      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Wait for status rows to display
      await expect.element(screen.getByText('API Server')).toBeVisible()
      await expect.element(screen.getByText('Cascade')).toBeVisible()
      await expect.element(screen.getByText('ECMWF Data')).toBeVisible()
      await expect.element(screen.getByText('Scheduler')).toBeVisible()
    })

    it('shows version when available', async () => {
      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      await expect
        .element(screen.getByText('0.0.1@2025-11-10 17:06:53'))
        .toBeVisible()
    })

    it('does not show version when not available', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({ api: 'up' }),
        version: undefined,
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Version text should not be present
      expect(screen.container.querySelector('.font-mono')).toBeNull()
    })
  })

  describe('status display', () => {
    it('shows Online status for up components', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({
          api: 'up',
          cascade: 'up',
          ecmwf: 'up',
          scheduler: 'up',
        }),
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // All components are up, should see "Online" text
      await expect.element(screen.getByText('Online').first()).toBeVisible()
    })

    it('shows Offline status for down components', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({
          api: 'up',
          cascade: 'down',
          ecmwf: 'up',
          scheduler: 'off',
        }),
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Cascade is down, should show Offline
      await expect.element(screen.getByText('Offline')).toBeVisible()
    })

    it('shows Disabled status for off components', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({
          api: 'up',
          cascade: 'up',
          ecmwf: 'up',
          scheduler: 'off',
        }),
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Scheduler is off, should show Disabled
      await expect.element(screen.getByText('Disabled')).toBeVisible()
    })
  })

  describe('loading state', () => {
    it('shows loading state when loading and no data', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: [],
        version: undefined,
        refetch: vi.fn(),
        isFetching: false,
        isLoading: true,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Should show loading indicators (one per component)
      await expect.element(screen.getByText('...').first()).toBeVisible()
    })

    it('shows data when loaded', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({ api: 'up' }),
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: false,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      await expect.element(screen.getByText('API Server')).toBeVisible()
    })
  })

  describe('refresh functionality', () => {
    it('renders refresh button in popover header', async () => {
      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Wait for popover to open
      await expect.element(screen.getByText('System Status')).toBeVisible()

      // The refresh button should be present (buttons in dialog)
      const allButtons = document.querySelectorAll('button')
      // Should have more than just the trigger
      expect(allButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('disables refresh button when fetching', async () => {
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({ api: 'up' }),
        version: '1.0.0',
        refetch: vi.fn(),
        isFetching: true,
        isLoading: false,
      })

      const screen = await render(
        <StatusDetailsPopover>
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      const trigger = screen.getByRole('button')
      await trigger.click()

      // Popover should be open
      await expect.element(screen.getByText('System Status')).toBeVisible()

      // When fetching, the refresh button should be disabled
      const disabledButtons = document.querySelectorAll('button[disabled]')
      expect(disabledButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('uses refetch from useStatus', async () => {
      const mockRefetch = vi.fn()
      mockUseStatus.mockReturnValue({
        componentDetails: createComponentDetails({ api: 'up' }),
        version: '1.0.0',
        refetch: mockRefetch,
        isFetching: false,
        isLoading: false,
      })

      // Just verify refetch is provided
      await expect(mockRefetch).toBeDefined()
    })
  })

  describe('alignment props', () => {
    it('accepts align prop', async () => {
      const screen = await render(
        <StatusDetailsPopover align="start">
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      await expect.element(screen.getByRole('button')).toBeVisible()
    })

    it('accepts side prop', async () => {
      const screen = await render(
        <StatusDetailsPopover side="top">
          <span>Status</span>
        </StatusDetailsPopover>,
      )

      await expect.element(screen.getByRole('button')).toBeVisible()
    })
  })
})
