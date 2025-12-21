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
import { QuickActionButton } from '@/features/dashboard/components/QuickActionButton'

// Mock TanStack Router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
}))

describe('QuickActionButton', () => {
  describe('rendering', () => {
    it('renders label text', async () => {
      const screen = await render(
        <QuickActionButton icon={<span>📊</span>} label="View Dashboard" />,
      )
      await expect.element(screen.getByText('View Dashboard')).toBeVisible()
    })

    it('renders icon', async () => {
      const screen = await render(
        <QuickActionButton
          icon={<span data-testid="icon">🔧</span>}
          label="Settings"
        />,
      )
      await expect.element(screen.getByTestId('icon')).toBeVisible()
    })
  })

  describe('link variant', () => {
    it('renders as Link when to prop is provided', async () => {
      const screen = await render(
        <QuickActionButton
          icon={<span>📊</span>}
          label="Go to Page"
          to="/dashboard"
        />,
      )
      await expect.element(screen.getByTestId('router-link')).toBeVisible()
    })

    it('renders link with correct href', async () => {
      const screen = await render(
        <QuickActionButton
          icon={<span>📊</span>}
          label="Go to Page"
          to="/settings"
        />,
      )
      const link = screen.getByTestId('router-link')
      await expect.element(link).toHaveAttribute('href', '/settings')
    })
  })

  describe('button variant', () => {
    it('renders as button when onClick is provided', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <QuickActionButton
          icon={<span>🔧</span>}
          label="Click Me"
          onClick={onClick}
        />,
      )
      const button = screen.getByRole('button', { name: /Click Me/ })
      await expect.element(button).toBeVisible()
    })

    it('calls onClick when clicked', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <QuickActionButton
          icon={<span>🔧</span>}
          label="Click Me"
          onClick={onClick}
        />,
      )
      const button = screen.getByRole('button', { name: /Click Me/ })
      await button.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('className', () => {
    it('accepts custom className for link variant', async () => {
      const screen = await render(
        <QuickActionButton
          icon={<span>📊</span>}
          label="Link"
          to="/page"
          className="custom-class"
        />,
      )
      await expect.element(screen.getByTestId('router-link')).toBeVisible()
    })

    it('accepts custom className for button variant', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <QuickActionButton
          icon={<span>🔧</span>}
          label="Button"
          onClick={onClick}
          className="custom-class"
        />,
      )
      await expect.element(screen.getByRole('button')).toBeVisible()
    })
  })
})
