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
import { Footer } from '@/components/layout/Footer'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="router-link">
      {children}
    </a>
  ),
}))

// Mock useStatus hook
const mockUseStatus = vi.fn()
vi.mock('@/api/hooks/useStatus', () => ({
  useStatus: () => mockUseStatus(),
}))

// Mock useUiStore
const mockLayoutMode = 'boxed'
vi.mock('@/stores/uiStore', () => ({
  useUiStore: (selector: (state: { layoutMode: string }) => unknown) =>
    selector({ layoutMode: mockLayoutMode }),
}))

// Mock StatusDetailsPopover
vi.mock('@/components/common/StatusDetailsPopover', () => ({
  StatusDetailsPopover: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="status-popover">{children}</div>
  ),
}))

// Mock StatusIndicator
vi.mock('@/components/common/StatusIndicator', () => ({
  StatusIndicator: ({ status }: { status: string }) => (
    <span data-testid="status-indicator">{status}</span>
  ),
}))

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseStatus.mockReturnValue({
      trafficLightStatus: 'green',
      isLoading: false,
    })
  })

  describe('rendering', () => {
    it('renders footer element with contentinfo role', async () => {
      const screen = await render(<Footer />)
      await expect.element(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders ECMWF copyright text', async () => {
      const screen = await render(<Footer />)
      await expect
        .element(
          screen.getByText(
            /European Centre for Medium-Range Weather Forecasts/,
          ),
        )
        .toBeVisible()
    })

    it('renders ECMWF link', async () => {
      const screen = await render(<Footer />)
      await expect.element(screen.getByText('ECMWF')).toBeVisible()
    })

    it('renders Destination Earth link', async () => {
      const screen = await render(<Footer />)
      await expect.element(screen.getByText('Destination Earth')).toBeVisible()
    })

    it('renders Help link', async () => {
      const screen = await render(<Footer />)
      await expect.element(screen.getByText('Help')).toBeVisible()
    })

    it('renders About link', async () => {
      const screen = await render(<Footer />)
      await expect.element(screen.getByText('About')).toBeVisible()
    })
  })

  describe('external links', () => {
    it('renders ECMWF link with external URL', async () => {
      const screen = await render(<Footer />)
      const ecmwfLink = screen.getByText('ECMWF').element().closest('a')
      expect(ecmwfLink).toHaveAttribute('href', 'https://www.ecmwf.int/')
      expect(ecmwfLink).toHaveAttribute('target', '_blank')
      expect(ecmwfLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders Destination Earth link with external URL', async () => {
      const screen = await render(<Footer />)
      const deLink = screen
        .getByText('Destination Earth')
        .element()
        .closest('a')
      expect(deLink).toHaveAttribute('href', 'https://destination-earth.eu')
      expect(deLink).toHaveAttribute('target', '_blank')
    })
  })

  describe('status indicator', () => {
    it('shows status indicator when not loading', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'green',
        isLoading: false,
      })
      const screen = await render(<Footer />)
      await expect
        .element(screen.getByTestId('status-indicator'))
        .toBeInTheDocument()
    })

    it('hides status indicator when loading', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'green',
        isLoading: true,
      })
      const screen = await render(<Footer />)
      expect(
        screen.container.querySelector('[data-testid="status-indicator"]'),
      ).toBeNull()
    })

    it('displays correct status from useStatus hook', async () => {
      mockUseStatus.mockReturnValue({
        trafficLightStatus: 'red',
        isLoading: false,
      })
      const screen = await render(<Footer />)
      await expect.element(screen.getByText('red')).toBeInTheDocument()
    })
  })
})
