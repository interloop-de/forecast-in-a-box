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
import { FiabStackSection } from '@/features/landing/components/FiabStackSection'

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
}))

describe('FiabStackSection', () => {
  describe('rendering', () => {
    it('renders section element', async () => {
      const screen = await render(<FiabStackSection />)

      const section = screen.container.querySelector('section')
      expect(section).toBeTruthy()
    })

    it('renders main description paragraph', async () => {
      const screen = await render(<FiabStackSection />)

      await expect
        .element(
          screen.getByText(
            /Forecast-in-a-Box integrates data access, model execution/,
          ),
        )
        .toBeVisible()
    })

    it('renders Powered by heading', async () => {
      const screen = await render(<FiabStackSection />)

      await expect
        .element(screen.getByRole('heading', { name: 'Powered by' }))
        .toBeVisible()
    })

    it('renders Learn More button', async () => {
      const screen = await render(<FiabStackSection />)

      await expect.element(screen.getByText('Learn More')).toBeVisible()
    })
  })

  describe('logos', () => {
    it('renders Anemoi logo', async () => {
      const screen = await render(<FiabStackSection />)

      const anemoiLogo = screen.getByAltText('Anemoi')
      await expect.element(anemoiLogo).toBeVisible()
    })

    it('renders EarthKit logo', async () => {
      const screen = await render(<FiabStackSection />)

      const earthkitLogo = screen.getByAltText('EarthKit')
      await expect.element(earthkitLogo).toBeVisible()
    })

    it('has correct logo sources', async () => {
      const screen = await render(<FiabStackSection />)

      const images = screen.container.querySelectorAll('img')
      expect(images.length).toBe(2)

      const srcs = Array.from(images).map((img) => img.getAttribute('src'))
      expect(srcs).toContain('/logos/packages/anemoi.webp')
      expect(srcs).toContain('/logos/packages/earthkit-light.svg')
    })
  })

  describe('links', () => {
    it('renders Destination Earth link', async () => {
      const screen = await render(<FiabStackSection />)

      const deLink = screen.getByText('Destination Earth')
      await expect.element(deLink).toBeVisible()
    })

    it('renders Anemoi link', async () => {
      const screen = await render(<FiabStackSection />)

      // Find the link in the description text
      const anemoiLink = screen.getByRole('link', { name: 'Anemoi' })
      await expect.element(anemoiLink).toBeVisible()
    })

    it('renders Earthkit link', async () => {
      const screen = await render(<FiabStackSection />)

      // Find the link in the description text
      const earthkitLink = screen.getByRole('link', { name: 'Earthkit' })
      await expect.element(earthkitLink).toBeVisible()
    })

    it('renders link to about page', async () => {
      const screen = await render(<FiabStackSection />)

      await expect.element(screen.getByTestId('link-about')).toBeVisible()
    })
  })

  describe('descriptions', () => {
    it('renders Anemoi description', async () => {
      const screen = await render(<FiabStackSection />)

      await expect
        .element(
          screen.getByText(
            /Open-source ML framework for developing, training, and deploying weather forecasting models/,
          ),
        )
        .toBeVisible()
    })

    it('renders EarthKit description', async () => {
      const screen = await render(<FiabStackSection />)

      await expect
        .element(
          screen.getByText(
            /Open-source tools for seamless earth science workflows/,
          ),
        )
        .toBeVisible()
    })
  })
})
