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
import { EmptyState } from '@/components/common/EmptyState'

describe('EmptyState', () => {
  describe('rendering', () => {
    it('renders title', async () => {
      const screen = await render(<EmptyState title="No items found" />)
      await expect.element(screen.getByText('No items found')).toBeVisible()
    })

    it('renders description when provided', async () => {
      const screen = await render(
        <EmptyState
          title="No items found"
          description="Try adjusting your search criteria"
        />,
      )
      await expect
        .element(screen.getByText('Try adjusting your search criteria'))
        .toBeVisible()
    })

    it('renders both title and description', async () => {
      const screen = await render(
        <EmptyState title="Empty list" description="No data available" />,
      )
      await expect.element(screen.getByText('Empty list')).toBeVisible()
      await expect.element(screen.getByText('No data available')).toBeVisible()
    })
  })

  describe('icon', () => {
    it('renders icon when provided', async () => {
      const screen = await render(
        <EmptyState
          title="No items found"
          icon={<span data-testid="test-icon">📦</span>}
        />,
      )
      await expect.element(screen.getByTestId('test-icon')).toBeVisible()
    })
  })

  describe('action button', () => {
    it('renders action button when provided', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <EmptyState
          title="No items found"
          action={{ label: 'Create new', onClick }}
        />,
      )
      const button = screen.getByRole('button', { name: 'Create new' })
      await expect.element(button).toBeVisible()
    })

    it('calls onClick when action button is clicked', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <EmptyState
          title="No items found"
          action={{ label: 'Create new', onClick }}
        />,
      )
      const button = screen.getByRole('button', { name: 'Create new' })
      await button.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('full composition', () => {
    it('renders all elements together', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <EmptyState
          title="No results"
          description="We could not find what you were looking for"
          icon={<span data-testid="search-icon">🔍</span>}
          action={{ label: 'Try again', onClick }}
        />,
      )
      await expect.element(screen.getByText('No results')).toBeVisible()
      await expect
        .element(
          screen.getByText('We could not find what you were looking for'),
        )
        .toBeVisible()
      await expect.element(screen.getByTestId('search-icon')).toBeVisible()
      await expect
        .element(screen.getByRole('button', { name: 'Try again' }))
        .toBeVisible()
    })
  })
})
