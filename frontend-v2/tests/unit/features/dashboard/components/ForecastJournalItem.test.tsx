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
import type { ForecastJob } from '@/features/dashboard/data/mockData'
import { ForecastJournalItem } from '@/features/dashboard/components/ForecastJournalItem'

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
  }: {
    children: React.ReactNode
    to: string
    search?: Record<string, unknown>
  }) => (
    <a
      href={`${to}?${new URLSearchParams(search as Record<string, string>).toString()}`}
      data-testid="router-link"
    >
      {children}
    </a>
  ),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'journal.item.model': `Model: ${params?.model || ''}`,
        'journal.item.started': `Started: ${params?.time || ''}`,
        'journal.item.products': `Products: ${params?.count || ''}`,
        'journal.item.scheduled': 'Scheduled',
        'journal.item.viewResults': 'View Results',
        'journal.item.viewError': 'View Error',
      }
      return translations[key] || key
    },
  }),
}))

const createMockJob = (overrides: Partial<ForecastJob> = {}): ForecastJob => ({
  id: 'job-123',
  name: 'Test Forecast',
  model: 'AIFS',
  status: 'completed',
  startedAt: '10:30 AM',
  productCount: 5,
  isScheduled: false,
  isBookmarked: false,
  tags: [],
  ...overrides,
})

describe('ForecastJournalItem', () => {
  describe('rendering', () => {
    it('renders job name', async () => {
      const job = createMockJob({ name: 'My Forecast' })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('My Forecast')).toBeVisible()
    })

    it('renders job id', async () => {
      const job = createMockJob({ id: 'abc-789' })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('#abc-789')).toBeVisible()
    })

    it('renders model info', async () => {
      const job = createMockJob({ model: 'GraphCast' })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText(/Model: GraphCast/)).toBeVisible()
    })

    it('renders tags', async () => {
      const job = createMockJob({ tags: ['europe', 'hourly'] })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('europe')).toBeVisible()
      await expect.element(screen.getByText('hourly')).toBeVisible()
    })
  })

  describe('scheduled badge', () => {
    it('shows scheduled badge when job is scheduled', async () => {
      const job = createMockJob({ isScheduled: true })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('Scheduled')).toBeVisible()
    })

    it('does not show scheduled badge when job is not scheduled', async () => {
      const job = createMockJob({ isScheduled: false })
      const screen = await render(<ForecastJournalItem job={job} />)
      expect(screen.container.textContent).not.toContain('Scheduled')
    })
  })

  describe('status display', () => {
    it('shows progress bar for running jobs', async () => {
      const job = createMockJob({ status: 'running', progress: 45 })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('45%')).toBeVisible()
    })

    it('shows View Results link for completed jobs', async () => {
      const job = createMockJob({ status: 'completed' })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('View Results')).toBeVisible()
    })

    it('shows View Error link for error jobs', async () => {
      const job = createMockJob({ status: 'error' })
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect.element(screen.getByText('View Error')).toBeVisible()
    })
  })

  describe('bookmark button', () => {
    it('renders bookmark button', async () => {
      const job = createMockJob()
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect
        .element(screen.getByLabelText('Bookmark'))
        .toBeInTheDocument()
    })

    it('renders more options button', async () => {
      const job = createMockJob()
      const screen = await render(<ForecastJournalItem job={job} />)
      await expect
        .element(screen.getByLabelText('More options'))
        .toBeInTheDocument()
    })
  })
})
