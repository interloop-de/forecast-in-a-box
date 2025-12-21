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
import { PublicLayout } from '@/components/layout/PublicLayout'

// Mock Header component
vi.mock('@/components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

// Mock Footer component
vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('PublicLayout', () => {
  it('renders header', async () => {
    const screen = await render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    )
    await expect.element(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders footer', async () => {
    const screen = await render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    )
    await expect.element(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders children in main element', async () => {
    const screen = await render(
      <PublicLayout>
        <div data-testid="child">Child Content</div>
      </PublicLayout>,
    )
    await expect.element(screen.getByTestId('child')).toBeVisible()
    await expect.element(screen.getByText('Child Content')).toBeVisible()
  })

  it('renders main element with flex-1 class', async () => {
    const screen = await render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    )
    const main = screen.container.querySelector('main')
    expect(main).toHaveClass('flex-1')
  })

  it('renders container with min-h-screen', async () => {
    const screen = await render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>,
    )
    const container = screen.container.firstElementChild
    expect(container).toHaveClass('min-h-screen')
  })
})
