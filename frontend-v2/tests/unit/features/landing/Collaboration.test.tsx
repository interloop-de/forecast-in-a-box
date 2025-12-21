/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { Collaboration } from '@/features/landing/components/Collaboration'

describe('Collaboration', () => {
  describe('rendering', () => {
    it('renders section element', async () => {
      const screen = await render(<Collaboration />)

      const section = screen.container.querySelector('section')
      expect(section).toBeTruthy()
    })

    it('renders heading', async () => {
      const screen = await render(<Collaboration />)

      await expect
        .element(screen.getByText('A Collaboration between'))
        .toBeVisible()
    })

    it('renders ECMWF logo', async () => {
      const screen = await render(<Collaboration />)

      const ecmwfLogo = screen.getByAltText('ECMWF')
      await expect.element(ecmwfLogo).toBeVisible()
    })

    it('renders MetNorway logo', async () => {
      const screen = await render(<Collaboration />)

      const metNorwayLogo = screen.getByAltText('MetNorway')
      await expect.element(metNorwayLogo).toBeVisible()
    })

    it('renders DestinE logo', async () => {
      const screen = await render(<Collaboration />)

      const destineLogo = screen.getByAltText('DestinE')
      await expect.element(destineLogo).toBeVisible()
    })

    it('has correct logo sources', async () => {
      const screen = await render(<Collaboration />)

      const images = screen.container.querySelectorAll('img')
      expect(images.length).toBe(3)

      const srcs = Array.from(images).map((img) => img.getAttribute('src'))
      expect(srcs).toContain('/logos/org/ECMWF.png')
      expect(srcs).toContain('/logos/org/MetNorway.png')
      expect(srcs).toContain('/logos/org/destine-fund.png')
    })
  })

  describe('styling', () => {
    it('applies background color class', async () => {
      const screen = await render(<Collaboration />)

      const section = screen.container.querySelector('section')
      expect(section?.classList.contains('bg-zinc-50')).toBe(true)
    })
  })
})
