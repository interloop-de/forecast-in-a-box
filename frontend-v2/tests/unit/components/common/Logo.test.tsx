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
import { Logo } from '@/components/common/Logo'

describe('Logo', () => {
  describe('rendering', () => {
    it('renders logo image', async () => {
      const screen = await render(<Logo />)
      const img = screen.getByRole('img', { name: 'Forecast In a Box Logo' })
      await expect.element(img).toBeVisible()
    })

    it('has correct alt text for accessibility', async () => {
      const screen = await render(<Logo />)
      const img = screen.getByRole('img', { name: 'Forecast In a Box Logo' })
      await expect.element(img).toBeVisible()
    })
  })

  describe('styling', () => {
    it('renders with default styling', async () => {
      const screen = await render(<Logo />)
      const img = screen.getByRole('img')
      await expect.element(img).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(<Logo className="custom-logo-class" />)
      const img = screen.getByRole('img')
      await expect.element(img).toBeVisible()
    })
  })
})
