/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { IntroGlobeSection } from '@/features/landing/components/IntroGlobeSection'

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
}))

// Mock RotatingGlobe (lazy loaded)
vi.mock('@/features/landing/components/RotatingGlobe.tsx', () => ({
  default: () => <div data-testid="rotating-globe">Globe</div>,
}))

describe('IntroGlobeSection', () => {
  describe('rendering', () => {
    it('renders section element', async () => {
      const screen = await render(<IntroGlobeSection />)

      const section = screen.container.querySelector('section')
      expect(section).toBeTruthy()
    })

    it('renders main heading', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect
        .element(
          screen.getByText(
            'Product generation on the fly, for any Anemoi model',
          ),
        )
        .toBeVisible()
    })

    it('renders description paragraph', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect
        .element(
          screen.getByText(
            /Forecast-in-a-Box reimagines how forecasts are produced and delivered/,
          ),
        )
        .toBeVisible()
    })

    it('renders Getting Started button', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect.element(screen.getByText('Getting Started')).toBeVisible()
    })

    it('renders link to configure page', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect.element(screen.getByTestId('link-configure')).toBeVisible()
    })

    it('renders globe component', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect.element(screen.getByTestId('rotating-globe')).toBeVisible()
    })
  })

  describe('content', () => {
    it('mentions self-contained forecasting environment', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect
        .element(screen.getByText(/self-contained forecasting environment/))
        .toBeVisible()
    })

    it('mentions data-intensive numerical weather prediction', async () => {
      const screen = await render(<IntroGlobeSection />)

      await expect
        .element(screen.getByText(/numerical weather prediction pipelines/))
        .toBeVisible()
    })
  })

  describe('styling', () => {
    it('has background styling container', async () => {
      const screen = await render(<IntroGlobeSection />)

      const bgContainer = screen.container.querySelector('.bg-muted')
      expect(bgContainer).toBeTruthy()
    })
  })
})
