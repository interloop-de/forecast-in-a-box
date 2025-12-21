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
import { NotificationBanner } from '@/components/common/NotificationBanner'

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
    <a href={to} className={className} data-testid="internal-link">
      {children}
    </a>
  ),
}))

describe('NotificationBanner', () => {
  describe('message', () => {
    it('renders message text', async () => {
      const screen = await render(
        <NotificationBanner message="System maintenance scheduled" />,
      )
      await expect
        .element(screen.getByText('System maintenance scheduled'))
        .toBeVisible()
    })

    it('has alert role for accessibility', async () => {
      const screen = await render(
        <NotificationBanner message="Important notice" />,
      )
      await expect.element(screen.getByRole('alert')).toBeVisible()
    })
  })

  describe('variants', () => {
    it('renders info variant by default', async () => {
      const screen = await render(<NotificationBanner message="Info message" />)
      await expect.element(screen.getByRole('alert')).toBeVisible()
    })

    it('renders warning variant', async () => {
      const screen = await render(
        <NotificationBanner message="Warning message" variant="warning" />,
      )
      await expect.element(screen.getByRole('alert')).toBeVisible()
    })

    it('renders error variant', async () => {
      const screen = await render(
        <NotificationBanner message="Error message" variant="error" />,
      )
      await expect.element(screen.getByRole('alert')).toBeVisible()
    })
  })

  describe('link', () => {
    it('renders internal link when linkHref is internal', async () => {
      const screen = await render(
        <NotificationBanner
          message="Click to continue"
          linkText="Learn more"
          linkHref="/docs"
        />,
      )
      const link = screen.getByTestId('internal-link')
      await expect.element(link).toBeVisible()
    })

    it('renders external link', async () => {
      const screen = await render(
        <NotificationBanner
          message="Visit our website"
          linkText="Go to site"
          linkHref="https://example.com"
        />,
      )
      const link = screen.getByRole('link', { name: 'Go to site' })
      await expect.element(link).toBeVisible()
    })

    it('does not render link when both linkText and linkHref not provided', async () => {
      const screen = await render(<NotificationBanner message="No link here" />)
      await expect.element(screen.getByText('No link here')).toBeVisible()
    })
  })

  describe('dismiss button', () => {
    it('renders dismiss button when onDismiss is provided', async () => {
      const onDismiss = vi.fn()
      const screen = await render(
        <NotificationBanner message="Dismissable" onDismiss={onDismiss} />,
      )
      const button = screen.getByRole('button', {
        name: 'Dismiss notification',
      })
      await expect.element(button).toBeVisible()
    })

    it('calls onDismiss when button is clicked', async () => {
      const onDismiss = vi.fn()
      const screen = await render(
        <NotificationBanner message="Dismissable" onDismiss={onDismiss} />,
      )
      const button = screen.getByRole('button', {
        name: 'Dismiss notification',
      })
      await button.click()
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not render dismiss button when onDismiss is not provided', async () => {
      const screen = await render(
        <NotificationBanner message="Not dismissable" />,
      )
      await expect.element(screen.getByText('Not dismissable')).toBeVisible()
    })
  })

  describe('custom className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <NotificationBanner
          message="Custom styled"
          className="my-custom-class"
        />,
      )
      await expect.element(screen.getByRole('alert')).toBeVisible()
    })
  })

  describe('full composition', () => {
    it('renders message, link, and dismiss button together', async () => {
      const onDismiss = vi.fn()
      const screen = await render(
        <NotificationBanner
          message="Important update available"
          linkText="Update now"
          linkHref="https://example.com/update"
          variant="warning"
          onDismiss={onDismiss}
        />,
      )
      await expect
        .element(screen.getByText('Important update available'))
        .toBeVisible()
      await expect
        .element(screen.getByRole('link', { name: 'Update now' }))
        .toBeVisible()
      await expect
        .element(screen.getByRole('button', { name: 'Dismiss notification' }))
        .toBeVisible()
    })
  })
})
