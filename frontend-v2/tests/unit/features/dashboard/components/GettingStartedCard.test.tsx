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
import { GettingStartedCard } from '@/features/dashboard/components/GettingStartedCard'

describe('GettingStartedCard', () => {
  const defaultProps = {
    icon: <span data-testid="icon">🚀</span>,
    title: 'Quick Start',
    description: 'Get started with your first forecast',
    tags: ['Beginner', 'Tutorial'],
  }

  describe('rendering', () => {
    it('renders icon', async () => {
      const screen = await render(<GettingStartedCard {...defaultProps} />)
      await expect.element(screen.getByTestId('icon')).toBeVisible()
    })

    it('renders title', async () => {
      const screen = await render(<GettingStartedCard {...defaultProps} />)
      await expect.element(screen.getByText('Quick Start')).toBeVisible()
    })

    it('renders description', async () => {
      const screen = await render(<GettingStartedCard {...defaultProps} />)
      await expect
        .element(screen.getByText('Get started with your first forecast'))
        .toBeVisible()
    })

    it('renders tags', async () => {
      const screen = await render(<GettingStartedCard {...defaultProps} />)
      await expect.element(screen.getByText('Beginner')).toBeVisible()
      await expect.element(screen.getByText('Tutorial')).toBeVisible()
    })
  })

  describe('recommended state', () => {
    it('shows recommended badge when isRecommended is true', async () => {
      const screen = await render(
        <GettingStartedCard {...defaultProps} isRecommended={true} />,
      )
      await expect.element(screen.getByText('Recommended')).toBeVisible()
    })

    it('does not show recommended badge by default', async () => {
      const screen = await render(<GettingStartedCard {...defaultProps} />)
      await expect.element(screen.getByText('Quick Start')).toBeVisible()
    })
  })

  describe('onClick', () => {
    it('calls onClick when card is clicked', async () => {
      const onClick = vi.fn()
      const screen = await render(
        <GettingStartedCard {...defaultProps} onClick={onClick} />,
      )
      const card = screen.getByText('Quick Start')
      await card.click()
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom styling', () => {
    it('accepts custom iconColor', async () => {
      const screen = await render(
        <GettingStartedCard
          {...defaultProps}
          iconColor="bg-red-100 text-red-500"
        />,
      )
      await expect.element(screen.getByTestId('icon')).toBeVisible()
    })

    it('accepts custom borderColor', async () => {
      const screen = await render(
        <GettingStartedCard {...defaultProps} borderColor="border-green-500" />,
      )
      await expect.element(screen.getByText('Quick Start')).toBeVisible()
    })
  })

  describe('multiple tags', () => {
    it('renders multiple tags', async () => {
      const screen = await render(
        <GettingStartedCard
          {...defaultProps}
          tags={['Tag1', 'Tag2', 'Tag3', 'Tag4']}
        />,
      )
      await expect.element(screen.getByText('Tag1')).toBeVisible()
      await expect.element(screen.getByText('Tag2')).toBeVisible()
      await expect.element(screen.getByText('Tag3')).toBeVisible()
      await expect.element(screen.getByText('Tag4')).toBeVisible()
    })

    it('renders with empty tags array', async () => {
      const screen = await render(
        <GettingStartedCard {...defaultProps} tags={[]} />,
      )
      await expect.element(screen.getByText('Quick Start')).toBeVisible()
    })
  })
})
