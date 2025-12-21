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
import { LoadingSplashScreen } from '@/components/LoadingSplashScreen'

describe('LoadingSplashScreen', () => {
  describe('loading state', () => {
    it('renders loading message', async () => {
      const screen = await render(<LoadingSplashScreen />)
      await expect
        .element(screen.getByText(/Loading configuration/))
        .toBeVisible()
    })

    it('shows spinner when not in error state', async () => {
      const screen = await render(<LoadingSplashScreen />)
      await expect
        .element(
          screen.getByText('Please wait while we set up the application'),
        )
        .toBeVisible()
    })
  })

  describe('error state', () => {
    it('renders error message when error prop is provided', async () => {
      const screen = await render(<LoadingSplashScreen error="Network error" />)
      await expect
        .element(screen.getByText('Configuration Error'))
        .toBeVisible()
    })

    it('displays the error details', async () => {
      const screen = await render(
        <LoadingSplashScreen error="Connection refused" />,
      )
      await expect.element(screen.getByText('Connection refused')).toBeVisible()
    })

    it('shows "Failed to load" message', async () => {
      const screen = await render(<LoadingSplashScreen error="Any error" />)
      await expect
        .element(screen.getByText('Failed to load application configuration:'))
        .toBeVisible()
    })

    it('shows contact support message', async () => {
      const screen = await render(<LoadingSplashScreen error="Error" />)
      await expect
        .element(
          screen.getByText('If the problem persists, please contact support.'),
        )
        .toBeVisible()
    })
  })

  describe('retry button', () => {
    it('shows retry button when onRetry is provided with error', async () => {
      const onRetry = vi.fn()
      const screen = await render(
        <LoadingSplashScreen error="Error occurred" onRetry={onRetry} />,
      )
      await expect
        .element(screen.getByRole('button', { name: 'Retry' }))
        .toBeVisible()
    })

    it('does not show retry button when no error', async () => {
      const onRetry = vi.fn()
      const screen = await render(<LoadingSplashScreen onRetry={onRetry} />)
      await expect
        .element(screen.getByText(/Loading configuration/))
        .toBeVisible()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn()
      const screen = await render(
        <LoadingSplashScreen error="Error occurred" onRetry={onRetry} />,
      )
      const button = screen.getByRole('button', { name: 'Retry' })
      await button.click()
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('does not show retry button when error but no onRetry handler', async () => {
      const screen = await render(
        <LoadingSplashScreen error="Error occurred" />,
      )
      await expect
        .element(screen.getByText('Configuration Error'))
        .toBeVisible()
    })
  })
})
