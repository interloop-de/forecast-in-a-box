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
import type { FilterType } from '@/features/dashboard/components/ForecastJournalFilters'
import { ForecastJournalFilters } from '@/features/dashboard/components/ForecastJournalFilters'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'journal.filters.all': 'All',
        'journal.filters.running': 'Running',
        'journal.filters.completed': 'Completed',
        'journal.filters.error': 'Error',
        'journal.filters.bookmarked': 'Bookmarked',
      }
      return translations[key] || key
    },
  }),
}))

describe('ForecastJournalFilters', () => {
  const filterTypes: Array<FilterType> = [
    'all',
    'running',
    'completed',
    'error',
    'bookmarked',
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all filter buttons', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      await expect.element(screen.getByText('All')).toBeInTheDocument()
      await expect.element(screen.getByText('Running')).toBeInTheDocument()
      await expect.element(screen.getByText('Completed')).toBeInTheDocument()
      await expect.element(screen.getByText('Error')).toBeInTheDocument()
      await expect.element(screen.getByText('Bookmarked')).toBeInTheDocument()
    })

    it('renders buttons in correct order', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      const buttons = screen.container.querySelectorAll('button')
      expect(buttons).toHaveLength(5)
      expect(buttons[0].textContent).toBe('All')
      expect(buttons[1].textContent).toBe('Running')
      expect(buttons[2].textContent).toBe('Completed')
      expect(buttons[3].textContent).toBe('Error')
      expect(buttons[4].textContent).toBe('Bookmarked')
    })

    it('has hidden on mobile and flex on md', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      const container = screen.container.firstElementChild as HTMLElement
      expect(container.classList.contains('hidden')).toBe(true)
      expect(container.classList.contains('md:flex')).toBe(true)
    })
  })

  describe('active filter styling', () => {
    for (const filterType of filterTypes) {
      it(`applies active styling when ${filterType} is active`, async () => {
        const onFilterChange = vi.fn()

        const screen = await render(
          <ForecastJournalFilters
            activeFilter={filterType}
            onFilterChange={onFilterChange}
          />,
        )

        const buttons = screen.container.querySelectorAll('button')
        const filterIndex = filterTypes.indexOf(filterType)
        const activeButton = buttons[filterIndex]

        expect(activeButton.classList.contains('bg-primary/10')).toBe(true)
        expect(activeButton.classList.contains('text-primary')).toBe(true)
      })
    }

    it('does not apply active styling to inactive filters', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      const buttons = screen.container.querySelectorAll('button')

      // First button (All) is active
      expect(buttons[0].classList.contains('bg-primary/10')).toBe(true)

      // Other buttons should not have active styling
      for (let i = 1; i < buttons.length; i++) {
        expect(buttons[i].classList.contains('bg-primary/10')).toBe(false)
        expect(buttons[i].classList.contains('text-primary')).toBe(false)
      }
    })
  })

  describe('click handling', () => {
    for (const filterType of filterTypes) {
      it(`calls onFilterChange with "${filterType}" when ${filterType} button is clicked`, async () => {
        const onFilterChange = vi.fn()

        const screen = await render(
          <ForecastJournalFilters
            activeFilter="all"
            onFilterChange={onFilterChange}
          />,
        )

        const filterIndex = filterTypes.indexOf(filterType)
        const buttons = screen.container.querySelectorAll('button')
        await buttons[filterIndex].click()

        expect(onFilterChange).toHaveBeenCalledWith(filterType)
        expect(onFilterChange).toHaveBeenCalledTimes(1)
      })
    }

    it('does not prevent clicking the currently active filter', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="running"
          onFilterChange={onFilterChange}
        />,
      )

      // Click the already active "Running" filter
      await screen.getByText('Running').click()

      expect(onFilterChange).toHaveBeenCalledWith('running')
    })
  })

  describe('button styling', () => {
    it('buttons have rounded and padding classes', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      const buttons = screen.container.querySelectorAll('button')
      for (const button of buttons) {
        expect(button.classList.contains('rounded-md')).toBe(true)
        expect(button.classList.contains('px-3')).toBe(true)
        expect(button.classList.contains('py-1.5')).toBe(true)
        expect(button.classList.contains('transition-colors')).toBe(true)
      }
    })

    it('inactive buttons have hover:bg-muted class', async () => {
      const onFilterChange = vi.fn()

      const screen = await render(
        <ForecastJournalFilters
          activeFilter="all"
          onFilterChange={onFilterChange}
        />,
      )

      const buttons = screen.container.querySelectorAll('button')

      // Inactive buttons should have hover:bg-muted
      for (let i = 1; i < buttons.length; i++) {
        expect(buttons[i].classList.contains('hover:bg-muted')).toBe(true)
      }
    })
  })
})
