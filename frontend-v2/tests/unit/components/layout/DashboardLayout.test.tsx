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
import { DashboardLayout } from '@/components/layout/DashboardLayout'

// Mock state
let mockDashboardVariant: 'classic' | 'modern' = 'classic'

// Mock useUiStore
vi.mock('@/stores/uiStore', () => ({
  useUiStore: (selector: (state: { dashboardVariant: string }) => unknown) => {
    const state = {
      dashboardVariant: mockDashboardVariant,
    }
    return selector(state)
  },
}))

// Mock AppShell
vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({
    children,
    notificationBanner,
    showSidebar,
    showFooter,
    useAuthenticatedHeader,
  }: {
    children: React.ReactNode
    notificationBanner?: React.ReactNode
    showSidebar?: boolean
    showFooter?: boolean
    useAuthenticatedHeader?: boolean
  }) => (
    <div
      data-testid="app-shell"
      data-show-sidebar={showSidebar}
      data-show-footer={showFooter}
      data-use-authenticated-header={useAuthenticatedHeader}
    >
      {notificationBanner && (
        <div data-testid="notification-slot">{notificationBanner}</div>
      )}
      <div data-testid="app-shell-content">{children}</div>
    </div>
  ),
}))

// Mock NotificationBanner
vi.mock('@/components/common/NotificationBanner', () => ({
  NotificationBanner: ({
    message,
    linkText,
    linkHref,
    onDismiss,
  }: {
    message: string
    linkText?: string
    linkHref?: string
    onDismiss?: () => void
  }) => (
    <div data-testid="notification-banner">
      <span data-testid="notification-message">{message}</span>
      {linkText && (
        <a data-testid="notification-link" href={linkHref}>
          {linkText}
        </a>
      )}
      <button data-testid="dismiss-button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  ),
}))

describe('DashboardLayout', () => {
  beforeEach(() => {
    mockDashboardVariant = 'classic'
  })

  describe('rendering', () => {
    it('renders children content', async () => {
      const screen = await render(
        <DashboardLayout>
          <div data-testid="content">Dashboard Content</div>
        </DashboardLayout>,
      )

      await expect.element(screen.getByTestId('content')).toBeVisible()
      await expect.element(screen.getByText('Dashboard Content')).toBeVisible()
    })

    it('renders AppShell wrapper', async () => {
      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      await expect.element(screen.getByTestId('app-shell')).toBeVisible()
    })
  })

  describe('AppShell configuration', () => {
    it('passes useAuthenticatedHeader=true to AppShell', async () => {
      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      const appShell = screen.getByTestId('app-shell')
      expect(appShell.element()).toHaveAttribute(
        'data-use-authenticated-header',
        'true',
      )
    })

    it('passes showSidebar=false to AppShell', async () => {
      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      const appShell = screen.getByTestId('app-shell')
      expect(appShell.element()).toHaveAttribute('data-show-sidebar', 'false')
    })

    it('passes showFooter=true to AppShell', async () => {
      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      const appShell = screen.getByTestId('app-shell')
      expect(appShell.element()).toHaveAttribute('data-show-footer', 'true')
    })
  })

  describe('notification banner', () => {
    it('shows notification banner when message is provided', async () => {
      const screen = await render(
        <DashboardLayout notificationMessage="Important update available">
          <div>Content</div>
        </DashboardLayout>,
      )

      await expect
        .element(screen.getByTestId('notification-banner'))
        .toBeVisible()
      await expect
        .element(screen.getByText('Important update available'))
        .toBeVisible()
    })

    it('does not show notification banner when no message', async () => {
      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      expect(
        screen.container.querySelector('[data-testid="notification-banner"]'),
      ).toBeNull()
    })

    it('passes link props to notification banner', async () => {
      const screen = await render(
        <DashboardLayout
          notificationMessage="Update available"
          notificationLinkText="Learn more"
          notificationLinkHref="/updates"
        >
          <div>Content</div>
        </DashboardLayout>,
      )

      const link = screen.getByTestId('notification-link')
      await expect.element(link).toBeVisible()
      expect(link.element()).toHaveAttribute('href', '/updates')
      await expect.element(screen.getByText('Learn more')).toBeVisible()
    })

    it('dismisses notification when dismiss button clicked', async () => {
      const screen = await render(
        <DashboardLayout notificationMessage="Test message">
          <div>Content</div>
        </DashboardLayout>,
      )

      // Initially visible
      await expect
        .element(screen.getByTestId('notification-banner'))
        .toBeVisible()

      // Click dismiss
      await screen.getByTestId('dismiss-button').click()

      // Should be hidden
      expect(
        screen.container.querySelector('[data-testid="notification-banner"]'),
      ).toBeNull()
    })
  })

  describe('dashboard variant', () => {
    it('applies classic variant styles by default', async () => {
      mockDashboardVariant = 'classic'

      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      const content = screen.getByTestId('app-shell-content')
      const innerDiv = content.element().querySelector('div')
      expect(innerDiv?.classList.contains('bg-muted/50')).toBe(false)
    })

    it('applies modern variant styles when dashboardVariant is modern', async () => {
      mockDashboardVariant = 'modern'

      const screen = await render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>,
      )

      const content = screen.getByTestId('app-shell-content')
      const innerDiv = content.element().querySelector('div')
      expect(innerDiv?.classList.contains('bg-muted/50')).toBe(true)
    })
  })
})
