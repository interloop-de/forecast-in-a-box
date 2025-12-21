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
  SourceStatusFilter,
  SourceTypeFilter,
} from '@/features/sources/components/SourcesFilters'
import type { AdminViewMode } from '@/stores/uiStore'
import { SourcesFilters } from '@/features/sources/components/SourcesFilters'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'filters.all': 'All',
        'filters.models': 'Models',
        'filters.datasets': 'Datasets',
        'filters.searchPlaceholder': 'Search sources...',
        'filters.ready': 'Ready',
        'filters.available': 'Available',
      }
      return translations[key] || key
    },
  }),
}))

describe('SourcesFilters', () => {
  const defaultProps = {
    typeFilter: 'all' as SourceTypeFilter,
    onTypeChange: vi.fn(),
    statusFilter: 'all' as SourceStatusFilter,
    onStatusChange: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    viewMode: 'table' as AdminViewMode,
    onViewModeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type filter', () => {
    it('renders type filter toggle group', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      // Use button role to distinguish from select value
      await expect
        .element(screen.getByRole('button', { name: 'All' }))
        .toBeVisible()
      await expect.element(screen.getByText('Models')).toBeVisible()
      await expect.element(screen.getByText('Datasets')).toBeVisible()
    })

    it('calls onTypeChange when model filter is clicked', async () => {
      const onTypeChange = vi.fn()
      const screen = await render(
        <SourcesFilters {...defaultProps} onTypeChange={onTypeChange} />,
      )

      const modelButton = screen.getByText('Models')
      await modelButton.click()

      expect(onTypeChange).toHaveBeenCalledWith('model')
    })

    it('calls onTypeChange when dataset filter is clicked', async () => {
      const onTypeChange = vi.fn()
      const screen = await render(
        <SourcesFilters {...defaultProps} onTypeChange={onTypeChange} />,
      )

      const datasetButton = screen.getByText('Datasets')
      await datasetButton.click()

      expect(onTypeChange).toHaveBeenCalledWith('dataset')
    })
  })

  describe('search input', () => {
    it('renders search input with placeholder', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      await expect
        .element(screen.getByPlaceholder('Search sources...'))
        .toBeVisible()
    })

    it('displays current search query', async () => {
      const screen = await render(
        <SourcesFilters {...defaultProps} searchQuery="test query" />,
      )

      const input = screen.getByPlaceholder('Search sources...')
      expect(input.element()).toHaveValue('test query')
    })

    it('calls onSearchChange when typing', async () => {
      const onSearchChange = vi.fn()
      const screen = await render(
        <SourcesFilters {...defaultProps} onSearchChange={onSearchChange} />,
      )

      const input = screen.getByPlaceholder('Search sources...')
      await input.fill('new search')

      expect(onSearchChange).toHaveBeenCalled()
    })
  })

  describe('status filter', () => {
    it('renders status filter select', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      // The select trigger should be visible
      const selectTrigger = screen.container.querySelector(
        '[data-slot="select-trigger"]',
      )
      expect(selectTrigger).not.toBeNull()
    })

    it('calls onStatusChange when status is selected', async () => {
      const onStatusChange = vi.fn()
      const screen = await render(
        <SourcesFilters {...defaultProps} onStatusChange={onStatusChange} />,
      )

      // Click the status select trigger
      const selectTriggers = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      expect(selectTriggers.length).toBeGreaterThan(0)
      await screen.getByRole('combobox').first().click()
      // Wait for dropdown to open and click Ready option
      await screen.getByRole('option', { name: 'Ready' }).click()
      expect(onStatusChange).toHaveBeenCalledWith('ready')
    })
  })

  describe('view mode toggle', () => {
    it('renders table view button', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      await expect
        .element(screen.getByRole('button', { name: 'Table view' }))
        .toBeVisible()
    })

    it('renders card view button', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      await expect
        .element(screen.getByRole('button', { name: 'Card view' }))
        .toBeVisible()
    })

    it('calls onViewModeChange when table view is clicked', async () => {
      const onViewModeChange = vi.fn()
      const screen = await render(
        <SourcesFilters
          {...defaultProps}
          viewMode="card"
          onViewModeChange={onViewModeChange}
        />,
      )

      const tableButton = screen.getByRole('button', { name: 'Table view' })
      await tableButton.click()

      expect(onViewModeChange).toHaveBeenCalledWith('table')
    })

    it('calls onViewModeChange when card view is clicked', async () => {
      const onViewModeChange = vi.fn()
      const screen = await render(
        <SourcesFilters
          {...defaultProps}
          viewMode="table"
          onViewModeChange={onViewModeChange}
        />,
      )

      const cardButton = screen.getByRole('button', { name: 'Card view' })
      await cardButton.click()

      expect(onViewModeChange).toHaveBeenCalledWith('card')
    })
  })

  describe('plugin filter', () => {
    it('does not render plugin filter when no plugins are available', async () => {
      const screen = await render(<SourcesFilters {...defaultProps} />)

      // Should only have one select (status filter)
      const selects = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      expect(selects.length).toBe(1)
    })

    it('renders plugin filter when plugins are available', async () => {
      const availablePlugins = [
        { id: 'plugin-1', name: 'Plugin 1' },
        { id: 'plugin-2', name: 'Plugin 2' },
      ]
      const onPluginChange = vi.fn()

      const screen = await render(
        <SourcesFilters
          {...defaultProps}
          availablePlugins={availablePlugins}
          pluginFilter="all"
          onPluginChange={onPluginChange}
        />,
      )

      // Should have two selects (status filter + plugin filter)
      const selects = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      expect(selects.length).toBe(2)
    })

    it('calls onPluginChange when plugin is selected', async () => {
      const availablePlugins = [
        { id: 'plugin-1', name: 'Plugin 1' },
        { id: 'plugin-2', name: 'Plugin 2' },
      ]
      const onPluginChange = vi.fn()

      const screen = await render(
        <SourcesFilters
          {...defaultProps}
          availablePlugins={availablePlugins}
          pluginFilter="all"
          onPluginChange={onPluginChange}
        />,
      )

      // Click the second select (plugin filter) using container query
      const selectTriggers = screen.container.querySelectorAll(
        '[data-slot="select-trigger"]',
      )
      const pluginSelect = selectTriggers[1] as HTMLElement | undefined
      expect(pluginSelect).toBeDefined()
      pluginSelect?.click()
      // Wait for dropdown and click Plugin 1
      await screen.getByRole('option', { name: 'Plugin 1' }).click()
      expect(onPluginChange).toHaveBeenCalledWith('plugin-1')
    })
  })
})
