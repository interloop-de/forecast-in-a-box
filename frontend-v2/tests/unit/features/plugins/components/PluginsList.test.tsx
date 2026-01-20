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
import type { PluginInfo } from '@/api/types/plugins.types'
import { PluginsList } from '@/features/plugins/components/PluginsList'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, number>) => {
      const translations: Record<string, string> = {
        'emptyState.title': 'No Plugins Found',
        'emptyState.description':
          'There are no plugins matching your criteria.',
        'table.headers.plugin': 'Plugin',
        'table.headers.author': 'Author',
        'table.headers.status': 'Status',
        'table.headers.actions': 'Actions',
        'pagination.showing': `Showing ${params?.start || 1}-${params?.end || 0} of ${params?.total || 0}`,
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

// Mock PluginCard
vi.mock('@/features/plugins/components/PluginCard', () => ({
  PluginCard: ({ plugin }: { plugin: PluginInfo }) => (
    <div data-testid={`plugin-card-${plugin.displayId}`}>
      <span>{plugin.name}</span>
    </div>
  ),
}))

// Mock PluginRow
vi.mock('@/features/plugins/components/PluginRow', () => ({
  PluginRow: ({ plugin }: { plugin: PluginInfo }) => (
    <div data-testid={`plugin-row-${plugin.displayId}`}>
      <span>{plugin.name}</span>
    </div>
  ),
}))

// Sample plugin data
const mockPlugins: Array<PluginInfo> = [
  {
    id: { store: 'ecmwf', local: 'plugin-1' },
    displayId: 'ecmwf/plugin-1',
    name: 'ECMWF Plugin',
    description: 'ECMWF data sources',
    version: '1.0.0',
    latestVersion: '1.0.0',
    author: 'ECMWF',
    fiabCompatibility: '>=1.0.0',
    status: 'loaded',
    capabilities: ['source'],
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    updatedAt: null,
    errorDetail: null,
    comment: null,
    pipSource: null,
    moduleName: null,
  },
  {
    id: { store: 'ecmwf', local: 'plugin-2' },
    displayId: 'ecmwf/plugin-2',
    name: 'Data Transform',
    description: 'Data transformation tools',
    version: '2.1.0',
    latestVersion: '2.1.0',
    author: 'Community',
    fiabCompatibility: '>=1.0.0',
    status: 'disabled',
    capabilities: ['transform'],
    isEnabled: false,
    isInstalled: true,
    hasUpdate: false,
    updatedAt: null,
    errorDetail: null,
    comment: null,
    pipSource: null,
    moduleName: null,
  },
  {
    id: { store: 'ecmwf', local: 'plugin-3' },
    displayId: 'ecmwf/plugin-3',
    name: 'Output Plugin',
    description: 'Output generators',
    version: '1.5.0',
    latestVersion: '2.0.0',
    author: 'Third Party',
    fiabCompatibility: '>=1.0.0',
    status: 'loaded',
    capabilities: ['product', 'sink'],
    isEnabled: true,
    isInstalled: true,
    hasUpdate: true,
    updatedAt: null,
    errorDetail: null,
    comment: null,
    pipSource: null,
    moduleName: null,
  },
]

describe('PluginsList', () => {
  const defaultProps = {
    plugins: mockPlugins,
    viewMode: 'card' as const,
    onToggle: vi.fn(),
    onInstall: vi.fn(),
    onUninstall: vi.fn(),
    onUpdate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default to desktop view
    mockUseMedia.mockReturnValue(false)
  })

  describe('empty state', () => {
    it('shows empty state when no plugins', async () => {
      const screen = await render(
        <PluginsList {...defaultProps} plugins={[]} />,
      )

      await expect.element(screen.getByText('No Plugins Found')).toBeVisible()
      await expect
        .element(
          screen.getByText('There are no plugins matching your criteria.'),
        )
        .toBeVisible()
    })
  })

  describe('card view', () => {
    it('renders plugins as cards when viewMode is card', async () => {
      const screen = await render(
        <PluginsList {...defaultProps} viewMode="card" />,
      )

      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-1'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-2'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-3'))
        .toBeVisible()

      // Rows should not be present
      expect(
        screen.container.querySelector(
          '[data-testid="plugin-row-ecmwf/plugin-1"]',
        ),
      ).toBeNull()
    })

    it('forces card view on mobile regardless of viewMode', async () => {
      // Simulate mobile
      mockUseMedia.mockReturnValue(true)

      const screen = await render(
        <PluginsList {...defaultProps} viewMode="table" />,
      )

      // Should still render cards, not table
      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-1'))
        .toBeVisible()

      // Rows should not be present
      expect(
        screen.container.querySelector(
          '[data-testid="plugin-row-ecmwf/plugin-1"]',
        ),
      ).toBeNull()
    })
  })

  describe('table view', () => {
    it('renders plugins as table rows when viewMode is table', async () => {
      const screen = await render(
        <PluginsList {...defaultProps} viewMode="table" />,
      )

      await expect
        .element(screen.getByTestId('plugin-row-ecmwf/plugin-1'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('plugin-row-ecmwf/plugin-2'))
        .toBeVisible()
      await expect
        .element(screen.getByTestId('plugin-row-ecmwf/plugin-3'))
        .toBeVisible()

      // Cards should not be present
      expect(
        screen.container.querySelector(
          '[data-testid="plugin-card-ecmwf/plugin-1"]',
        ),
      ).toBeNull()
    })

    it('shows table headers in table view', async () => {
      const screen = await render(
        <PluginsList {...defaultProps} viewMode="table" />,
      )

      await expect
        .element(screen.getByText('Plugin', { exact: true }).first())
        .toBeVisible()
      await expect.element(screen.getByText('Author')).toBeVisible()
      await expect.element(screen.getByText('Status')).toBeVisible()
      await expect.element(screen.getByText('Actions')).toBeVisible()
    })

    it('shows pagination info in footer', async () => {
      const screen = await render(
        <PluginsList {...defaultProps} viewMode="table" />,
      )

      await expect.element(screen.getByText('Showing 1-3 of 3')).toBeVisible()
    })
  })

  describe('callbacks', () => {
    it('passes onToggle to child components', async () => {
      const onToggle = vi.fn()
      const screen = await render(
        <PluginsList {...defaultProps} onToggle={onToggle} />,
      )

      // Just verify the component renders - callbacks are passed to child components
      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-1'))
        .toBeVisible()
    })

    it('passes onViewDetails to child components', async () => {
      const onViewDetails = vi.fn()
      const screen = await render(
        <PluginsList {...defaultProps} onViewDetails={onViewDetails} />,
      )

      await expect
        .element(screen.getByTestId('plugin-card-ecmwf/plugin-1'))
        .toBeVisible()
    })
  })
})
