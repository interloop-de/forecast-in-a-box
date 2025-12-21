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
import { UninstalledPluginsSection } from '@/features/plugins/components/UninstalledPluginsSection'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'uninstalledSection.title': 'Uninstalled plugins',
        'uninstalledSection.description':
          'Browse and install plugins from the ECMWF Plugin Store.',
        'uninstalledSection.total': `Total: ${params?.count || 0}`,
        'uninstalledSection.searchPlaceholder': 'Search uninstalled plugins...',
        'emptyState.title': 'No plugins found',
        'emptyState.noUninstalled': 'No uninstalled plugins',
        'emptyState.noUninstalledDescription':
          'All plugins are already installed.',
      }
      return translations[key] || key
    },
  }),
}))

// Mock PluginCard
vi.mock('@/features/plugins/components/PluginCard', () => ({
  PluginCard: ({
    plugin,
    onInstall,
  }: {
    plugin: PluginInfo
    onInstall: (id: string) => void
  }) => (
    <div data-testid={`plugin-card-${plugin.id}`}>
      <span data-testid="plugin-name">{plugin.name}</span>
      <span data-testid="plugin-status">{plugin.status}</span>
      <button
        data-testid="install-button"
        onClick={() => onInstall(plugin.id)}
        disabled={plugin.status === 'incompatible'}
      >
        Install
      </button>
    </div>
  ),
}))

// Mock Input
vi.mock('@/components/ui/input', () => ({
  Input: ({
    placeholder,
    value,
    onChange,
    className,
  }: {
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
  }) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}))

const createMockPlugin = (overrides: Partial<PluginInfo> = {}): PluginInfo => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin for testing',
  version: '1.0.0',
  author: 'ECMWF',
  fiabCompatibility: '>=1.0.0',
  capabilities: ['source'],
  status: 'uninstalled',
  isInstalled: false,
  isEnabled: false,
  hasUpdate: false,
  store: 'ecmwf-fiab-store',
  ...overrides,
})

describe('UninstalledPluginsSection', () => {
  const mockOnInstall = vi.fn()
  const mockOnViewDetails = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByText('Uninstalled plugins'))
        .toBeVisible()
    })

    it('renders plugin count', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1', name: 'Plugin 1' }),
        createMockPlugin({ id: 'plugin-2', name: 'Plugin 2' }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect.element(screen.getByText('Total: 2')).toBeVisible()
    })

    it('renders description', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(
          screen.getByText(
            'Browse and install plugins from the ECMWF Plugin Store.',
          ),
        )
        .toBeVisible()
    })

    it('renders search input', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByTestId('search-input'))
        .toBeInTheDocument()
    })

    it('renders plugin cards for each plugin', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1', name: 'Plugin 1' }),
        createMockPlugin({ id: 'plugin-2', name: 'Plugin 2' }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByTestId('plugin-card-plugin-1'))
        .toBeInTheDocument()
      await expect
        .element(screen.getByTestId('plugin-card-plugin-2'))
        .toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty state when no plugins', async () => {
      const screen = await render(
        <UninstalledPluginsSection
          plugins={[]}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByText('No uninstalled plugins'))
        .toBeVisible()
      await expect
        .element(screen.getByText('All plugins are already installed.'))
        .toBeVisible()
    })
  })

  describe('plugin statuses', () => {
    it('renders uninstalled plugins', async () => {
      const plugins = [
        createMockPlugin({
          id: 'uninstalled-plugin',
          name: 'Uninstalled Plugin',
          status: 'uninstalled',
        }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByTestId('plugin-card-uninstalled-plugin'))
        .toBeInTheDocument()
    })

    it('renders incompatible plugins', async () => {
      const plugins = [
        createMockPlugin({
          id: 'incompatible-plugin',
          name: 'Incompatible Plugin',
          status: 'incompatible',
        }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect
        .element(screen.getByTestId('plugin-card-incompatible-plugin'))
        .toBeInTheDocument()
    })

    it('sorts uninstalled plugins before incompatible', async () => {
      const plugins = [
        createMockPlugin({
          id: 'incompatible-1',
          name: 'AAA Incompatible',
          status: 'incompatible',
        }),
        createMockPlugin({
          id: 'uninstalled-1',
          name: 'ZZZ Uninstalled',
          status: 'uninstalled',
        }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      // Uninstalled should appear first despite being alphabetically later
      const cards = screen.container.querySelectorAll(
        '[data-testid^="plugin-card-"]',
      )
      expect(cards[0].getAttribute('data-testid')).toBe(
        'plugin-card-uninstalled-1',
      )
      expect(cards[1].getAttribute('data-testid')).toBe(
        'plugin-card-incompatible-1',
      )
    })
  })

  describe('search filtering', () => {
    it('filters plugins by search query', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1', name: 'Weather Plugin' }),
        createMockPlugin({ id: 'plugin-2', name: 'Ocean Plugin' }),
      ]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )

      const searchInput = screen.getByTestId('search-input')
      await searchInput.fill('Weather')

      // After filtering, only Weather Plugin should be visible
      await expect
        .element(screen.getByTestId('plugin-card-plugin-1'))
        .toBeInTheDocument()
      expect(
        screen.container.querySelector('[data-testid="plugin-card-plugin-2"]'),
      ).toBeNull()
    })
  })

  describe('install action', () => {
    it('calls onInstall when install button clicked', async () => {
      const plugins = [createMockPlugin({ id: 'test-plugin' })]
      const screen = await render(
        <UninstalledPluginsSection
          plugins={plugins}
          onInstall={mockOnInstall}
          onViewDetails={mockOnViewDetails}
        />,
      )

      const installButton = screen.getByTestId('install-button')
      await installButton.click()

      expect(mockOnInstall).toHaveBeenCalledWith('test-plugin')
    })
  })
})
