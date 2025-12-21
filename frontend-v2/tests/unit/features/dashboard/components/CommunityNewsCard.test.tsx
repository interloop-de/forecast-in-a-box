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
import { CommunityNewsCard } from '@/features/dashboard/components/CommunityNewsCard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'community.title': 'Community & News',
        'community.latestModels': 'Latest Models',
        'community.latestTopics': 'Forum Topics',
        'community.new': 'New',
        'community.released': `Released ${params?.time || ''}`,
        'community.postedBy': `By ${params?.author || ''} · ${params?.time || ''}`,
        'community.viewRegistry': 'View Registry',
        'community.visitForum': 'Visit Forum',
      }
      return translations[key] || key
    },
  }),
}))

// Mock the Card and Badge components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}))

// Mock the mockData to have predictable test data
vi.mock('@/features/dashboard/data/mockData', () => ({
  mockModels: [
    { name: 'AIFS', version: 'v1.0', isNew: true, releasedAt: '2 days ago' },
    {
      name: 'GraphCast',
      version: 'v2.1',
      isNew: false,
      releasedAt: '1 week ago',
    },
  ],
  mockForumTopics: [
    {
      title: 'Getting started with AIFS',
      author: 'John',
      postedAt: '3 hours ago',
    },
    {
      title: 'Best practices for forecasting',
      author: 'Jane',
      postedAt: '1 day ago',
    },
  ],
}))

describe('CommunityNewsCard', () => {
  describe('rendering', () => {
    it('renders card title', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('Community & News')).toBeVisible()
    })

    it('renders Latest Models section', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('Latest Models')).toBeVisible()
    })

    it('renders Forum Topics section', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('Forum Topics')).toBeVisible()
    })
  })

  describe('models section', () => {
    it('renders model names with versions', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('AIFS v1.0')).toBeVisible()
      await expect.element(screen.getByText('GraphCast v2.1')).toBeVisible()
    })

    it('shows New badge for new models', async () => {
      const screen = await render(<CommunityNewsCard />)
      // Use getByTestId to get the badge specifically (not the title containing "News")
      await expect.element(screen.getByTestId('badge')).toBeInTheDocument()
    })

    it('renders View Registry link', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('View Registry')).toBeVisible()
    })

    it('View Registry links to GitHub', async () => {
      const screen = await render(<CommunityNewsCard />)
      const link = screen.getByText('View Registry').element().closest('a')
      expect(link).toHaveAttribute('href', 'https://github.com/ecmwf/anemoi')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('forum topics section', () => {
    it('renders forum topic titles', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect
        .element(screen.getByText('Getting started with AIFS'))
        .toBeVisible()
      await expect
        .element(screen.getByText('Best practices for forecasting'))
        .toBeVisible()
    })

    it('renders topic author and time', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText(/By John/)).toBeVisible()
    })

    it('renders Visit Forum link', async () => {
      const screen = await render(<CommunityNewsCard />)
      await expect.element(screen.getByText('Visit Forum')).toBeVisible()
    })

    it('Visit Forum links to ECMWF forum', async () => {
      const screen = await render(<CommunityNewsCard />)
      const link = screen.getByText('Visit Forum').element().closest('a')
      expect(link).toHaveAttribute('href', 'https://forum.ecmwf.int')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })
})
