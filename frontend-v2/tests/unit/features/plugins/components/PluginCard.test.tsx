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
import { PluginCard } from '@/features/plugins/components/PluginCard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actions.update': 'Update',
        'actions.viewDetails': 'View Details',
        'actions.enable': 'Enable',
        'actions.disable': 'Disable',
        'actions.install': 'Install',
        'actions.viewDocs': 'View Docs',
        'actions.reportIssue': 'Report Issue',
      }
      return translations[key] || key
    },
  }),
}))

// Mock child components
vi.mock('@/features/plugins/components/CapabilityBadges', () => ({
  CapabilityBadges: ({ capabilities }: { capabilities: Array<string> }) => (
    <div data-testid="capability-badges">{capabilities.join(', ')}</div>
  ),
}))

vi.mock('@/features/plugins/components/PluginIcon', () => ({
  PluginIcon: () => <div data-testid="plugin-icon">Icon</div>,
}))

vi.mock('@/features/plugins/components/PluginStatusBadge', () => ({
  PluginStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}))

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    title,
    variant,
    size,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    title?: string
    variant?: string
    size?: string
    className?: string
  }) => (
    <button
      data-testid={
        size === 'icon'
          ? 'icon-button'
          : variant === 'ghost'
            ? 'ghost-button'
            : 'button'
      }
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
    >
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    'aria-label': ariaLabel,
  }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    'aria-label': string
  }) => (
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      aria-label={ariaLabel}
      data-testid="switch"
    />
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-item">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

const createMockPlugin = (overrides: Partial<PluginInfo> = {}): PluginInfo => ({
  id: { store: 'ecmwf', local: 'test-plugin' },
  displayId: 'ecmwf/test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin for testing',
  version: '1.0.0',
  latestVersion: '1.0.0',
  author: 'Test Author',
  fiabCompatibility: '>=1.0.0',
  capabilities: ['source', 'sink'],
  status: 'loaded',
  isInstalled: true,
  isEnabled: true,
  hasUpdate: false,
  updatedAt: null,
  errorDetail: null,
  comment: null,
  pipSource: null,
  moduleName: null,
  ...overrides,
})

describe('PluginCard', () => {
  const mockOnToggle = vi.fn()
  const mockOnInstall = vi.fn()
  const mockOnUninstall = vi.fn()
  const mockOnUpdate = vi.fn()
  const mockOnViewDetails = vi.fn()

  describe('rendering', () => {
    it('renders plugin name', async () => {
      const plugin = createMockPlugin({ name: 'My Plugin' })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByText('My Plugin')).toBeVisible()
    })

    it('renders plugin description', async () => {
      const plugin = createMockPlugin({
        description: 'Plugin description here',
      })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect
        .element(screen.getByText('Plugin description here'))
        .toBeVisible()
    })

    it('renders plugin author', async () => {
      const plugin = createMockPlugin({ author: 'John Doe' })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByText('John Doe')).toBeVisible()
    })

    it('renders plugin version', async () => {
      const plugin = createMockPlugin({ version: '2.5.0' })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByText('v2.5.0')).toBeVisible()
    })

    it('renders plugin icon', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect
        .element(screen.getByTestId('plugin-icon'))
        .toBeInTheDocument()
    })

    it('renders status badge', async () => {
      const plugin = createMockPlugin({ status: 'loaded' })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect
        .element(screen.getByTestId('status-badge'))
        .toBeInTheDocument()
    })

    it('renders capability badges', async () => {
      const plugin = createMockPlugin({ capabilities: ['source', 'transform'] })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect
        .element(screen.getByTestId('capability-badges'))
        .toBeInTheDocument()
    })
  })

  describe('installed plugin actions', () => {
    it('shows View Details button for installed plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: true, hasUpdate: false })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
          onViewDetails={mockOnViewDetails}
        />,
      )
      await expect.element(screen.getByText('View Details')).toBeVisible()
    })

    it('shows Update button when plugin has update', async () => {
      const plugin = createMockPlugin({ isInstalled: true, hasUpdate: true })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByText('Update')).toBeVisible()
    })

    it('shows toggle switch for installed plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: true })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByRole('switch')).toBeInTheDocument()
    })
  })

  describe('uninstalled plugin actions', () => {
    it('shows Install button for uninstalled plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: false })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByText('Install')).toBeVisible()
    })

    it('does not show toggle switch for uninstalled plugins', async () => {
      const plugin = createMockPlugin({ isInstalled: false })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      expect(screen.container.querySelector('[role="switch"]')).toBeNull()
    })
  })

  describe('callback handlers', () => {
    it('calls onUpdate when Update button is clicked', async () => {
      const plugin = createMockPlugin({ isInstalled: true, hasUpdate: true })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      const updateButton = screen.getByText('Update')
      await updateButton.click()
      expect(mockOnUpdate).toHaveBeenCalledWith({
        store: 'ecmwf',
        local: 'test-plugin',
      })
    })

    it('renders toggle switch for installed plugins', async () => {
      const plugin = createMockPlugin({
        isInstalled: true,
        isEnabled: true,
      })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      const toggle = screen.getByRole('switch')
      await expect.element(toggle).toBeInTheDocument()
    })

    it('shows delete button for installed plugins', async () => {
      const plugin = createMockPlugin({
        isInstalled: true,
      })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      // The uninstall button should be present (has Trash2 icon)
      const buttons = screen.container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(1)
    })

    it('calls onInstall when Install button is clicked', async () => {
      const plugin = createMockPlugin({ isInstalled: false })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      const installButton = screen.getByText('Install')
      await installButton.click()
      expect(mockOnInstall).toHaveBeenCalledWith({
        store: 'ecmwf',
        local: 'test-plugin',
      })
    })

    it('shows Install button for available plugins', async () => {
      const plugin = createMockPlugin({
        isInstalled: false,
        status: 'available',
      })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      const installButton = screen
        .getByText('Install')
        .element() as HTMLButtonElement
      expect(installButton.disabled).toBe(false)
    })

    it('calls onViewDetails when View Details button is clicked', async () => {
      const plugin = createMockPlugin({ isInstalled: true, hasUpdate: false })
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
          onViewDetails={mockOnViewDetails}
        />,
      )
      const viewDetailsButton = screen.getByText('View Details')
      await viewDetailsButton.click()
      expect(mockOnViewDetails).toHaveBeenCalledWith(plugin)
    })
  })

  describe('dropdown menu', () => {
    it('renders dropdown menu', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginCard
          plugin={plugin}
          onToggle={mockOnToggle}
          onInstall={mockOnInstall}
          onUninstall={mockOnUninstall}
          onUpdate={mockOnUpdate}
        />,
      )
      await expect.element(screen.getByTestId('dropdown')).toBeInTheDocument()
    })
  })
})
