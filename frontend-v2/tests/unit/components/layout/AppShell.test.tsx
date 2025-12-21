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
import { AppShell } from '@/components/layout/AppShell'

// Mock state
let mockIsSidebarOpen = true
let mockLayoutMode: 'full' | 'boxed' = 'full'

// Mock useUiStore
vi.mock('@/stores/uiStore', () => ({
  useUiStore: (
    selector: (state: {
      isSidebarOpen: boolean
      layoutMode: string
    }) => unknown,
  ) => {
    const state = {
      isSidebarOpen: mockIsSidebarOpen,
      layoutMode: mockLayoutMode,
    }
    return selector(state)
  },
}))

// Mock Header components
vi.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Public Header</header>,
}))

vi.mock('@/components/layout/AuthenticatedHeader', () => ({
  AuthenticatedHeader: () => (
    <header data-testid="authenticated-header">Authenticated Header</header>
  ),
}))

// Mock Sidebar
vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}))

// Mock Footer
vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('AppShell', () => {
  beforeEach(() => {
    mockIsSidebarOpen = true
    mockLayoutMode = 'full'
  })

  describe('rendering', () => {
    it('renders children content', async () => {
      const screen = await render(
        <AppShell>
          <div data-testid="content">Main Content</div>
        </AppShell>,
      )

      await expect.element(screen.getByTestId('content')).toBeVisible()
      await expect.element(screen.getByText('Main Content')).toBeVisible()
    })

    it('renders main element', async () => {
      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      const main = screen.container.querySelector('main')
      expect(main).toBeTruthy()
    })
  })

  describe('header', () => {
    it('renders public header by default', async () => {
      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      await expect.element(screen.getByTestId('header')).toBeVisible()
      expect(
        screen.container.querySelector('[data-testid="authenticated-header"]'),
      ).toBeNull()
    })

    it('renders authenticated header when useAuthenticatedHeader is true', async () => {
      const screen = await render(
        <AppShell useAuthenticatedHeader>
          <div>Content</div>
        </AppShell>,
      )

      await expect
        .element(screen.getByTestId('authenticated-header'))
        .toBeVisible()
      expect(
        screen.container.querySelector('[data-testid="header"]'),
      ).toBeNull()
    })
  })

  describe('sidebar', () => {
    it('shows sidebar when showSidebar is true and sidebar is open', async () => {
      mockIsSidebarOpen = true

      const screen = await render(
        <AppShell showSidebar>
          <div>Content</div>
        </AppShell>,
      )

      await expect.element(screen.getByTestId('sidebar')).toBeVisible()
    })

    it('hides sidebar when showSidebar is false', async () => {
      mockIsSidebarOpen = true

      const screen = await render(
        <AppShell showSidebar={false}>
          <div>Content</div>
        </AppShell>,
      )

      expect(
        screen.container.querySelector('[data-testid="sidebar"]'),
      ).toBeNull()
    })

    it('hides sidebar when sidebar is closed in store', async () => {
      mockIsSidebarOpen = false

      const screen = await render(
        <AppShell showSidebar>
          <div>Content</div>
        </AppShell>,
      )

      expect(
        screen.container.querySelector('[data-testid="sidebar"]'),
      ).toBeNull()
    })
  })

  describe('footer', () => {
    it('shows footer by default', async () => {
      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      await expect.element(screen.getByTestId('footer')).toBeVisible()
    })

    it('hides footer when showFooter is false', async () => {
      const screen = await render(
        <AppShell showFooter={false}>
          <div>Content</div>
        </AppShell>,
      )

      expect(
        screen.container.querySelector('[data-testid="footer"]'),
      ).toBeNull()
    })
  })

  describe('notification banner', () => {
    it('renders notification banner when provided', async () => {
      const screen = await render(
        <AppShell
          notificationBanner={
            <div data-testid="notification">Important Notice</div>
          }
        >
          <div>Content</div>
        </AppShell>,
      )

      await expect.element(screen.getByTestId('notification')).toBeVisible()
      await expect.element(screen.getByText('Important Notice')).toBeVisible()
    })

    it('does not render notification banner when not provided', async () => {
      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      expect(
        screen.container.querySelector('[data-testid="notification"]'),
      ).toBeNull()
    })
  })

  describe('layout mode', () => {
    it('applies full width by default', async () => {
      mockLayoutMode = 'full'

      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      const main = screen.container.querySelector('main')
      expect(main?.classList.contains('max-w-7xl')).toBe(false)
    })

    it('applies boxed layout when layoutMode is boxed', async () => {
      mockLayoutMode = 'boxed'

      const screen = await render(
        <AppShell>
          <div>Content</div>
        </AppShell>,
      )

      const main = screen.container.querySelector('main')
      expect(main?.classList.contains('max-w-7xl')).toBe(true)
    })
  })
})
