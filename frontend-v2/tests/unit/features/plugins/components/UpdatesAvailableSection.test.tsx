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
import { UpdatesAvailableSection } from '@/features/plugins/components/UpdatesAvailableSection'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'updatesSection.title': 'Updates Available',
        'updatesSection.currentVersion': `Current: v${params?.version || ''}`,
        'actions.releaseNotes': 'View Release Notes',
        'actions.updateNow': 'Update Now',
      }
      return translations[key] || key
    },
  }),
}))

// Mock PluginIcon
vi.mock('@/features/plugins/components/PluginIcon', () => ({
  PluginIcon: ({ size }: { size: string }) => (
    <div data-testid="plugin-icon" data-size={size}>
      Icon
    </div>
  ),
}))

// Mock Button
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const createMockPlugin = (overrides: Partial<PluginInfo> = {}): PluginInfo => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin for testing',
  version: '1.0.0',
  latestVersion: '2.0.0',
  author: 'Test Author',
  fiabCompatibility: '>=1.0.0',
  capabilities: ['source'],
  status: 'active',
  isInstalled: true,
  isEnabled: true,
  hasUpdate: true,
  store: 'ecmwf',
  isDefault: false,
  ...overrides,
})

describe('UpdatesAvailableSection', () => {
  const mockOnUpdate = vi.fn()
  const mockOnViewReleaseNotes = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('empty state', () => {
    it('returns null when plugins array is empty', async () => {
      const screen = await render(
        <UpdatesAvailableSection plugins={[]} onUpdate={mockOnUpdate} />,
      )
      expect(screen.container.textContent).toBe('')
    })
  })

  describe('rendering', () => {
    it('renders section title', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('Updates Available')).toBeVisible()
    })

    it('renders plugin count in header', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1' }),
        createMockPlugin({ id: 'plugin-2' }),
      ]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText(/\(2\)/)).toBeVisible()
    })

    it('renders plugin name', async () => {
      const plugins = [createMockPlugin({ name: 'Weather Plugin' })]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('Weather Plugin')).toBeVisible()
    })

    it('renders plugin description', async () => {
      const plugins = [
        createMockPlugin({ description: 'Weather forecasting plugin' }),
      ]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect
        .element(screen.getByText('Weather forecasting plugin'))
        .toBeVisible()
    })

    it('renders plugin author', async () => {
      const plugins = [createMockPlugin({ author: 'ECMWF' })]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('ECMWF')).toBeVisible()
    })

    it('renders current version', async () => {
      const plugins = [createMockPlugin({ version: '1.5.0' })]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('Current: v1.5.0')).toBeVisible()
    })

    it('renders latest version badge', async () => {
      const plugins = [createMockPlugin({ latestVersion: '2.0.0' })]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText(/UPDATE v2\.0\.0/)).toBeVisible()
    })

    it('renders plugin icon with lg size', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      const icon = screen.getByTestId('plugin-icon')
      await expect.element(icon).toBeInTheDocument()
      expect(icon.element().getAttribute('data-size')).toBe('lg')
    })

    it('renders Update Now button', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('Update Now')).toBeVisible()
    })
  })

  describe('callback handlers', () => {
    it('calls onUpdate when Update Now button is clicked', async () => {
      const plugins = [createMockPlugin({ id: 'plugin-123' })]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      const updateButton = screen.getByText('Update Now')
      await updateButton.click()
      expect(mockOnUpdate).toHaveBeenCalledWith('plugin-123')
    })

    it('renders release notes button when onViewReleaseNotes is provided', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UpdatesAvailableSection
          plugins={plugins}
          onUpdate={mockOnUpdate}
          onViewReleaseNotes={mockOnViewReleaseNotes}
        />,
      )
      await expect.element(screen.getByText('View Release Notes')).toBeVisible()
    })

    it('does not render release notes button when onViewReleaseNotes is not provided', async () => {
      const plugins = [createMockPlugin()]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      expect(screen.container.textContent).not.toContain('View Release Notes')
    })

    it('calls onViewReleaseNotes when release notes button is clicked', async () => {
      const plugin = createMockPlugin({ id: 'plugin-456' })
      const screen = await render(
        <UpdatesAvailableSection
          plugins={[plugin]}
          onUpdate={mockOnUpdate}
          onViewReleaseNotes={mockOnViewReleaseNotes}
        />,
      )
      const releaseNotesButton = screen.getByText('View Release Notes')
      await releaseNotesButton.click()
      expect(mockOnViewReleaseNotes).toHaveBeenCalledWith(plugin)
    })
  })

  describe('multiple plugins', () => {
    it('renders all plugins with updates', async () => {
      const plugins = [
        createMockPlugin({ id: 'plugin-1', name: 'Plugin One' }),
        createMockPlugin({ id: 'plugin-2', name: 'Plugin Two' }),
        createMockPlugin({ id: 'plugin-3', name: 'Plugin Three' }),
      ]
      const screen = await render(
        <UpdatesAvailableSection plugins={plugins} onUpdate={mockOnUpdate} />,
      )
      await expect.element(screen.getByText('Plugin One')).toBeVisible()
      await expect.element(screen.getByText('Plugin Two')).toBeVisible()
      await expect.element(screen.getByText('Plugin Three')).toBeVisible()
    })
  })
})
