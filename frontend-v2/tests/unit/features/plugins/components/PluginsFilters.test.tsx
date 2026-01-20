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
import type {
  CapabilityFilter,
  StatusFilter,
} from '@/features/plugins/components/PluginsFilters'
import { PluginsFilters } from '@/features/plugins/components/PluginsFilters'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'filters.searchPlaceholder': 'Search plugins...',
        'filters.status.all': 'All Status',
        'filters.status.loaded': 'Loaded',
        'filters.status.disabled': 'Disabled',
        'filters.status.available': 'Available',
        'filters.status.errored': 'Errored',
        'filters.capability.all': 'All Capabilities',
        'filters.capability.source': 'Source',
        'filters.capability.transform': 'Transform',
        'filters.capability.product': 'Product',
        'filters.capability.sink': 'Sink',
      }
      return translations[key] || key
    },
  }),
}))

// Mock useUiStore
const mockSetViewMode = vi.fn()
vi.mock('@/stores/uiStore', () => ({
  useUiStore: (
    selector: (state: {
      pluginsViewMode: string
      setPluginsViewMode: () => void
    }) => unknown,
  ) => {
    const state = {
      pluginsViewMode: 'table',
      setPluginsViewMode: mockSetViewMode,
    }
    return selector(state)
  },
}))

describe('PluginsFilters', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    statusFilter: 'all' as StatusFilter,
    onStatusFilterChange: vi.fn(),
    capabilityFilter: 'all' as CapabilityFilter,
    onCapabilityFilterChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search input', () => {
    it('renders search input with placeholder', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      await expect
        .element(screen.getByPlaceholder('Search plugins...'))
        .toBeVisible()
    })

    it('displays current search query', async () => {
      const screen = await render(
        <PluginsFilters {...defaultProps} searchQuery="test query" />,
      )

      const input = screen.getByPlaceholder('Search plugins...')
      expect(input.element()).toHaveValue('test query')
    })

    it('calls onSearchChange when typing', async () => {
      const onSearchChange = vi.fn()
      const screen = await render(
        <PluginsFilters {...defaultProps} onSearchChange={onSearchChange} />,
      )

      const input = screen.getByPlaceholder('Search plugins...')
      await input.fill('new search')

      expect(onSearchChange).toHaveBeenCalled()
    })
  })

  describe('status filter', () => {
    it('renders status filter select', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      // Status select should be present
      const selectTriggers = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      expect(selectTriggers.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onStatusFilterChange when status is selected', async () => {
      const onStatusFilterChange = vi.fn()
      const screen = await render(
        <PluginsFilters
          {...defaultProps}
          onStatusFilterChange={onStatusFilterChange}
        />,
      )

      // Click first select (status)
      const selectTrigger = screen.container.querySelector(
        '[data-slot="select-trigger"]',
      )
      if (selectTrigger) {
        ;(selectTrigger as HTMLElement).click()
        await screen.getByRole('option', { name: 'Loaded' }).click()
        expect(onStatusFilterChange).toHaveBeenCalledWith('loaded')
      }
    })
  })

  describe('capability filter', () => {
    it('renders capability filter select', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      // Should have two selects (status + capability)
      const selectTriggers = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      expect(selectTriggers.length).toBe(2)
    })

    it('calls onCapabilityFilterChange when capability is selected', async () => {
      const onCapabilityFilterChange = vi.fn()
      const screen = await render(
        <PluginsFilters
          {...defaultProps}
          onCapabilityFilterChange={onCapabilityFilterChange}
        />,
      )

      // Click second select (capability)
      const selectTriggers = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      const capabilitySelect = selectTriggers[1] as HTMLElement | undefined
      expect(capabilitySelect).toBeDefined()
      capabilitySelect?.click()
      await screen.getByRole('option', { name: 'Source' }).click()
      expect(onCapabilityFilterChange).toHaveBeenCalledWith('source')
    })
  })

  describe('view mode toggle', () => {
    it('renders table view button', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      await expect
        .element(screen.getByRole('button', { name: 'Table view' }))
        .toBeVisible()
    })

    it('renders card view button', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      await expect
        .element(screen.getByRole('button', { name: 'Card view' }))
        .toBeVisible()
    })

    it('calls setViewMode when table view is clicked', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      const tableButton = screen.getByRole('button', { name: 'Table view' })
      await tableButton.click()

      expect(mockSetViewMode).toHaveBeenCalledWith('table')
    })

    it('calls setViewMode when card view is clicked', async () => {
      const screen = await render(<PluginsFilters {...defaultProps} />)

      const cardButton = screen.getByRole('button', { name: 'Card view' })
      await cardButton.click()

      expect(mockSetViewMode).toHaveBeenCalledWith('card')
    })
  })
})
