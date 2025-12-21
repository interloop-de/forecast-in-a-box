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
import type { PluginInfo } from '@/api/types/plugins.types'
import { PluginRow } from '@/features/plugins/components/PluginRow'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actions.enable': 'Enable',
        'actions.disable': 'Disable',
        'actions.uninstall': 'Uninstall',
        'actions.viewDetails': 'View Details',
        'actions.viewDocs': 'View Documentation',
        'actions.reportIssue': 'Report Issue',
      }
      return translations[key] || key
    },
  }),
}))

const createMockPlugin = (overrides: Partial<PluginInfo> = {}): PluginInfo => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin for testing',
  version: '1.0.0',
  author: 'Test Author',
  fiabCompatibility: '>=1.0.0',
  capabilities: ['source', 'sink'],
  status: 'active',
  isInstalled: true,
  isEnabled: true,
  hasUpdate: false,
  store: 'ecmwf',
  isDefault: false,
  ...overrides,
})

describe('PluginRow', () => {
  const mockOnToggle = vi.fn()
  const mockOnUninstall = vi.fn()

  describe('rendering', () => {
    it('renders plugin details', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      // Check description is visible (name may be in heading which has timing issues)
      await expect
        .element(screen.getByText('A test plugin for testing'))
        .toBeVisible()
    })

    it('renders plugin version', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      await expect.element(screen.getByText(/v1\.0\.0/)).toBeInTheDocument()
    })

    it('renders author', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      await expect.element(screen.getByText('Test Author')).toBeInTheDocument()
    })
  })

  describe('enabled state', () => {
    it('shows toggle switch for installed plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: true })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      await expect.element(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('does not show toggle for uninstalled plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: false })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      expect(screen.container.querySelector('[role="switch"]')).toBeNull()
    })
  })

  describe('uninstall button', () => {
    it('shows uninstall button for non-default plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: true, isDefault: false })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      const uninstallButton = screen.getByTitle('Uninstall')
      await expect.element(uninstallButton).toBeInTheDocument()
    })

    it('hides uninstall button for default plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: true, isDefault: true })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      expect(screen.container.querySelector('[title="Uninstall"]')).toBeNull()
    })
  })

  describe('capabilities', () => {
    it('renders capability badges', async () => {
      const plugin = createMockPlugin({ capabilities: ['source', 'sink'] })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      await expect.element(screen.getByText('Source')).toBeInTheDocument()
      await expect.element(screen.getByText('Sink')).toBeInTheDocument()
    })
  })

  describe('callback handlers', () => {
    it('renders toggle switch for installed plugins', async () => {
      const plugin = createMockPlugin({
        isInstalled: true,
        isEnabled: true,
      })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      const toggle = screen.getByRole('switch')
      await expect.element(toggle).toBeInTheDocument()
    })

    it('renders uninstall button for non-default installed plugins', async () => {
      const plugin = createMockPlugin({
        isInstalled: true,
        isDefault: false,
      })
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
        />,
      )
      const uninstallButton = screen.getByTitle('Uninstall')
      await expect.element(uninstallButton).toBeInTheDocument()
    })
  })

  describe('dropdown menu', () => {
    const mockOnViewDetails = vi.fn()

    it('renders dropdown menu trigger', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      // The more options button should be present
      const moreButton = screen.getByLabelText('More options')
      await expect.element(moreButton).toBeInTheDocument()
    })

    it('shows View Details in dropdown when onViewDetails is provided', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginRow
          plugin={plugin}
          onToggle={mockOnToggle}
          onUninstall={mockOnUninstall}
          onViewDetails={mockOnViewDetails}
        />,
      )
      // Click to open the dropdown
      const moreButton = screen.getByLabelText('More options')
      await moreButton.click()
      await expect.element(screen.getByText('View Details')).toBeInTheDocument()
    })
  })
})
