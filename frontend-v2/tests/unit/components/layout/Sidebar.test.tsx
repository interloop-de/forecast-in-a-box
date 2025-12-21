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
import { Sidebar } from '@/components/layout/Sidebar'

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    activeProps,
  }: {
    children: React.ReactNode
    to: string
    className?: string
    activeProps?: { className?: string }
  }) => (
    <a
      href={to}
      className={className}
      data-active-class={activeProps?.className}
      data-testid={`link-${to.replace('/', '') || 'home'}`}
    >
      {children}
    </a>
  ),
}))

describe('Sidebar', () => {
  describe('rendering', () => {
    it('renders sidebar container', async () => {
      const screen = await render(<Sidebar />)

      const sidebar = screen.container.querySelector('aside')
      expect(sidebar).toBeTruthy()
    })

    it('renders navigation element', async () => {
      const screen = await render(<Sidebar />)

      const nav = screen.container.querySelector('nav')
      expect(nav).toBeTruthy()
    })

    it('renders Dashboard link', async () => {
      const screen = await render(<Sidebar />)

      await expect.element(screen.getByText('Dashboard')).toBeVisible()
    })

    it('renders About link', async () => {
      const screen = await render(<Sidebar />)

      await expect.element(screen.getByText('About')).toBeVisible()
    })
  })

  describe('links', () => {
    it('Dashboard link points to root path', async () => {
      const screen = await render(<Sidebar />)

      const dashboardLink = screen.getByTestId('link-home')
      expect(dashboardLink.element()).toHaveAttribute('href', '/')
    })

    it('About link points to about path', async () => {
      const screen = await render(<Sidebar />)

      const aboutLink = screen.getByTestId('link-about')
      expect(aboutLink.element()).toHaveAttribute('href', '/about')
    })
  })

  describe('styling', () => {
    it('applies custom className when provided', async () => {
      const screen = await render(<Sidebar className="custom-class" />)

      const sidebar = screen.container.querySelector('aside')
      expect(sidebar?.classList.contains('custom-class')).toBe(true)
    })

    it('has default width class', async () => {
      const screen = await render(<Sidebar />)

      const sidebar = screen.container.querySelector('aside')
      expect(sidebar?.classList.contains('w-64')).toBe(true)
    })

    it('has border class', async () => {
      const screen = await render(<Sidebar />)

      const sidebar = screen.container.querySelector('aside')
      expect(sidebar?.classList.contains('border-r')).toBe(true)
    })
  })
})
