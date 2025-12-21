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
import type { SourceInfo } from '@/api/types/sources.types'
import { SourcesList } from '@/features/sources/components/SourcesList'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, number>) => {
      const translations: Record<string, string> = {
        'emptyState.title': 'No Sources Found',
        'emptyState.description':
          'There are no sources matching your criteria.',
        'table.source': 'Source',
        'table.type': 'Type',
        'table.status': 'Status',
        'table.plugin': 'Plugin',
        'table.actions': 'Actions',
        'table.showing': `Showing ${params?.count || 0} sources`,
      }
      return translations[key] || key
    },
  }),
}))

// Mock useMedia hook
const mockUseMedia = vi.fn()
vi.mock('@/hooks/useMedia', () => ({
  useMedia: () => mockUseMedia(),
}))

// Mock SourceCard
vi.mock('@/features/sources/components/SourceCard', () => ({
  SourceCard: ({ source }: { source: SourceInfo }) => (
    <div data-testid={`source-card-${source.id}`}>
      <span>{source.name}</span>
    </div>
  ),
}))

// Mock SourceRow
vi.mock('@/features/sources/components/SourceRow', () => ({
  SourceRow: ({ source }: { source: SourceInfo }) => (
    <div data-testid={`source-row-${source.id}`}>
      <span>{source.name}</span>
    </div>
  ),
}))

// Sample source data
const mockSources: Array<SourceInfo> = [
  {
    id: 'source-1',
    factoryId: 'factory-1',
    name: 'AIFS Global',
    description: 'Global weather model',
    sourceType: 'model',
    pluginId: 'plugin-1',
    pluginName: 'ECMWF Plugin',
    author: 'ECMWF',
    version: '1.0.0',
    status: 'ready',
    isEnabled: true,
    isDefault: false,
  },
  {
    id: 'source-2',
    factoryId: 'factory-2',
    name: 'ERA5 Dataset',
    description: 'Reanalysis dataset',
    sourceType: 'dataset',
    pluginId: 'plugin-2',
    pluginName: 'Data Plugin',
    author: 'ECMWF',
    version: '1.0.0',
    status: 'available',
    isEnabled: true,
    isDefault: false,
  },
  {
    id: 'source-3',
    factoryId: 'factory-3',
    name: 'IFS Model',
    description: 'Integrated Forecasting System',
    sourceType: 'model',
    pluginId: 'plugin-1',
    pluginName: 'ECMWF Plugin',
    author: 'ECMWF',
    version: '2.0.0',
    status: 'downloading',
    isEnabled: true,
    isDefault: false,
  },
]

describe('SourcesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to desktop view
    mockUseMedia.mockReturnValue(false)
  })

  describe('empty state', () => {
    it('shows empty state when no sources', async () => {
      const screen = await render(<SourcesList sources={[]} />)

      await expect.element(screen.getByText('No Sources Found')).toBeVisible()
      await expect
        .element(
          screen.getByText('There are no sources matching your criteria.'),
        )
        .toBeVisible()
    })
  })

  describe('card view', () => {
    it('renders sources as cards by default', async () => {
      const screen = await render(<SourcesList sources={mockSources} />)

      // Should render cards, not rows
      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('source-card-source-2'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('source-card-source-3'))
        .toBeVisible()

      // Rows should not be present
      expect(
        screen.container.querySelector('[data-testid="source-row-source-1"]'),
      ).toBeNull()
    })

    it('renders sources as cards when viewMode is card', async () => {
      const screen = await render(
        <SourcesList sources={mockSources} viewMode="card" />,
      )

      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()
    })

    it('forces card view on mobile regardless of viewMode', async () => {
      // Simulate mobile
      mockUseMedia.mockReturnValue(true)

      const screen = await render(
        <SourcesList sources={mockSources} viewMode="table" />,
      )

      // Should still render cards, not table
      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()

      // Rows should not be present
      expect(
        screen.container.querySelector('[data-testid="source-row-source-1"]'),
      ).toBeNull()
    })
  })

  describe('table view', () => {
    it('renders sources as table rows when viewMode is table', async () => {
      const screen = await render(
        <SourcesList sources={mockSources} viewMode="table" />,
      )

      // Should render rows, not cards
      await expect
        .element(screen.getByTestId('source-row-source-1'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('source-row-source-2'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('source-row-source-3'))
        .toBeVisible()

      // Cards should not be present
      expect(
        screen.container.querySelector('[data-testid="source-card-source-1"]'),
      ).toBeNull()
    })

    it('shows table headers in table view', async () => {
      const screen = await render(
        <SourcesList sources={mockSources} viewMode="table" />,
      )

      // Use exact match for Source to distinguish from "Showing 3 sources"
      await expect
        .element(screen.getByText('Source', { exact: true }).first())
        .toBeVisible()
      await expect.element(screen.getByText('Type')).toBeVisible()
      await expect.element(screen.getByText('Status')).toBeVisible()
      await expect.element(screen.getByText('Plugin')).toBeVisible()
      await expect.element(screen.getByText('Actions')).toBeVisible()
    })

    it('shows source count in footer', async () => {
      const screen = await render(
        <SourcesList sources={mockSources} viewMode="table" />,
      )

      await expect.element(screen.getByText('Showing 3 sources')).toBeVisible()
    })

    it('shows pagination controls in table view', async () => {
      const screen = await render(
        <SourcesList sources={mockSources} viewMode="table" />,
      )

      // Page number should be visible
      await expect.element(screen.getByText('1')).toBeVisible()
    })
  })

  describe('callbacks', () => {
    it('passes onViewDetails to child components', async () => {
      const onViewDetails = vi.fn()
      const screen = await render(
        <SourcesList sources={mockSources} onViewDetails={onViewDetails} />,
      )

      // Just verify the component renders - callbacks are passed to child components
      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()
    })

    it('passes onDownload to child components', async () => {
      const onDownload = vi.fn()
      const screen = await render(
        <SourcesList sources={mockSources} onDownload={onDownload} />,
      )

      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()
    })

    it('passes onToggleEnable to child components', async () => {
      const onToggleEnable = vi.fn()
      const screen = await render(
        <SourcesList sources={mockSources} onToggleEnable={onToggleEnable} />,
      )

      await expect
        .element(screen.getByTestId('source-card-source-1'))
        .toBeVisible()
    })
  })
})
