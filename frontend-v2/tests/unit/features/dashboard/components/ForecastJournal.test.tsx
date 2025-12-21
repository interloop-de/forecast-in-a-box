/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ForecastJournal } from '@/features/dashboard/components/ForecastJournal'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'journal.title': 'Forecast Journal',
        'journal.searchPlaceholder': 'Search forecasts...',
        'journal.noResults': 'No forecasts found',
        'journal.loadMore': 'Load More',
        'journal.filters.all': 'All',
        'journal.filters.running': 'Running',
        'journal.filters.completed': 'Completed',
        'journal.filters.error': 'Error',
        'journal.filters.bookmarked': 'Bookmarked',
        'journal.item.productsSingular': 'product',
        'journal.item.productsPlural': 'products',
        'journal.item.scheduled': 'Scheduled',
        'journal.item.bookmarked': 'Bookmarked',
      }
      return translations[key] || key
    },
  }),
}))

// Mock ForecastJournalFilters component
vi.mock('@/features/dashboard/components/ForecastJournalFilters', () => ({
  ForecastJournalFilters: ({
    activeFilter,
    onFilterChange,
  }: {
    activeFilter: string
    onFilterChange: (filter: string) => void
  }) => (
    <div data-testid="filters">
      <button data-testid="filter-all" onClick={() => onFilterChange('all')}>
        All {activeFilter === 'all' ? '(active)' : ''}
      </button>
      <button
        data-testid="filter-running"
        onClick={() => onFilterChange('running')}
      >
        Running {activeFilter === 'running' ? '(active)' : ''}
      </button>
      <button
        data-testid="filter-completed"
        onClick={() => onFilterChange('completed')}
      >
        Completed {activeFilter === 'completed' ? '(active)' : ''}
      </button>
      <button
        data-testid="filter-error"
        onClick={() => onFilterChange('error')}
      >
        Error {activeFilter === 'error' ? '(active)' : ''}
      </button>
      <button
        data-testid="filter-bookmarked"
        onClick={() => onFilterChange('bookmarked')}
      >
        Bookmarked {activeFilter === 'bookmarked' ? '(active)' : ''}
      </button>
    </div>
  ),
}))

// Mock ForecastJournalItem component
vi.mock('@/features/dashboard/components/ForecastJournalItem', () => ({
  ForecastJournalItem: ({
    job,
  }: {
    job: { id: string; name: string; model: string; status: string }
  }) => (
    <div data-testid={`job-${job.id}`} data-status={job.status}>
      <span data-testid="job-name">{job.name}</span>
      <span data-testid="job-model">{job.model}</span>
    </div>
  ),
}))

describe('ForecastJournal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders journal title', async () => {
      const screen = await render(<ForecastJournal />)

      await expect.element(screen.getByText('Forecast Journal')).toBeVisible()
    })

    it('renders search input', async () => {
      const screen = await render(<ForecastJournal />)

      await expect
        .element(screen.getByPlaceholder('Search forecasts...'))
        .toBeVisible()
    })

    it('renders filter buttons', async () => {
      const screen = await render(<ForecastJournal />)

      await expect.element(screen.getByTestId('filters')).toBeVisible()
      await expect.element(screen.getByTestId('filter-all')).toBeVisible()
      await expect.element(screen.getByTestId('filter-running')).toBeVisible()
    })

    it('renders all jobs by default', async () => {
      const screen = await render(<ForecastJournal />)

      // Should see all 6 mock jobs
      await expect.element(screen.getByTestId('job-a3f7c2d')).toBeVisible()
      await expect.element(screen.getByTestId('job-8k9m2p1')).toBeVisible()
      await expect.element(screen.getByTestId('job-f2d8a1c')).toBeVisible()
      await expect.element(screen.getByTestId('job-b7k3n9x')).toBeVisible()
      await expect.element(screen.getByTestId('job-c5m8q4r')).toBeVisible()
      await expect.element(screen.getByTestId('job-d1p6v2w')).toBeVisible()
    })

    it('renders load more button when jobs exist', async () => {
      const screen = await render(<ForecastJournal />)

      await expect.element(screen.getByText('Load More')).toBeVisible()
    })
  })

  describe('filtering', () => {
    it('filters by running status', async () => {
      const screen = await render(<ForecastJournal />)

      // Click running filter
      const runningFilter = screen.getByTestId('filter-running')
      await runningFilter.click()

      // Should only see running jobs
      await expect.element(screen.getByTestId('job-a3f7c2d')).toBeVisible() // running
      await expect.element(screen.getByTestId('job-d1p6v2w')).toBeVisible() // running

      // Completed and error jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-8k9m2p1"]'),
      ).toBeNull()
      expect(
        screen.container.querySelector('[data-testid="job-b7k3n9x"]'),
      ).toBeNull()
    })

    it('filters by completed status', async () => {
      const screen = await render(<ForecastJournal />)

      // Click completed filter
      const completedFilter = screen.getByTestId('filter-completed')
      await completedFilter.click()

      // Should see completed jobs (3 of them)
      await expect.element(screen.getByTestId('job-8k9m2p1')).toBeVisible()
      await expect.element(screen.getByTestId('job-f2d8a1c')).toBeVisible()
      await expect.element(screen.getByTestId('job-c5m8q4r')).toBeVisible()

      // Running jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-a3f7c2d"]'),
      ).toBeNull()
    })

    it('filters by error status', async () => {
      const screen = await render(<ForecastJournal />)

      // Click error filter
      const errorFilter = screen.getByTestId('filter-error')
      await errorFilter.click()

      // Should only see error job
      await expect.element(screen.getByTestId('job-b7k3n9x')).toBeVisible()

      // Other jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-a3f7c2d"]'),
      ).toBeNull()
    })

    it('shows empty state when filter returns no results', async () => {
      const screen = await render(<ForecastJournal />)

      // Click bookmarked filter (no jobs are bookmarked in mock data)
      const bookmarkedFilter = screen.getByTestId('filter-bookmarked')
      await bookmarkedFilter.click()

      // Should show no results message
      await expect.element(screen.getByText('No forecasts found')).toBeVisible()

      // Load more button should not be visible
      const loadMoreButton = screen.container.querySelector(
        'button[data-testid="load-more"]',
      )
      expect(loadMoreButton).toBeNull()
    })

    it('returns to all jobs when all filter is clicked', async () => {
      const screen = await render(<ForecastJournal />)

      // First filter to error only
      const errorFilter = screen.getByTestId('filter-error')
      await errorFilter.click()

      // Verify only error job
      await expect.element(screen.getByTestId('job-b7k3n9x')).toBeVisible()

      // Click all filter
      const allFilter = screen.getByTestId('filter-all')
      await allFilter.click()

      // Should see all jobs again
      await expect.element(screen.getByTestId('job-a3f7c2d')).toBeVisible()
      await expect.element(screen.getByTestId('job-8k9m2p1')).toBeVisible()
    })
  })

  describe('searching', () => {
    it('searches by job name', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('Europe')

      // Should only see Europe job
      await expect.element(screen.getByTestId('job-a3f7c2d')).toBeVisible()

      // Other jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-8k9m2p1"]'),
      ).toBeNull()
    })

    it('searches by model name', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('IFS ENS')

      // Should only see job with IFS ENS model
      await expect.element(screen.getByTestId('job-8k9m2p1')).toBeVisible()

      // Other jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-a3f7c2d"]'),
      ).toBeNull()
    })

    it('searches by job id', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('f2d8a1c')

      // Should only see that specific job
      await expect.element(screen.getByTestId('job-f2d8a1c')).toBeVisible()

      // Other jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-a3f7c2d"]'),
      ).toBeNull()
    })

    it('searches by tag', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('marine')

      // Should only see job with marine tag
      await expect.element(screen.getByTestId('job-c5m8q4r')).toBeVisible()

      // Other jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-a3f7c2d"]'),
      ).toBeNull()
    })

    it('search is case insensitive', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('EUROPE')

      // Should still find Europe job
      await expect.element(screen.getByTestId('job-a3f7c2d')).toBeVisible()
    })

    it('shows empty state when search returns no results', async () => {
      const screen = await render(<ForecastJournal />)

      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('nonexistent')

      // Should show no results message
      await expect.element(screen.getByText('No forecasts found')).toBeVisible()
    })
  })

  describe('combined filtering and searching', () => {
    it('applies both filter and search', async () => {
      const screen = await render(<ForecastJournal />)

      // Filter to completed
      const completedFilter = screen.getByTestId('filter-completed')
      await completedFilter.click()

      // Then search for "Asia"
      const searchInput = screen.getByPlaceholder('Search forecasts...')
      await searchInput.fill('Asia')

      // Should only see completed Asia job
      await expect.element(screen.getByTestId('job-f2d8a1c')).toBeVisible()

      // Other completed jobs should not be visible
      expect(
        screen.container.querySelector('[data-testid="job-8k9m2p1"]'),
      ).toBeNull()
    })
  })
})
