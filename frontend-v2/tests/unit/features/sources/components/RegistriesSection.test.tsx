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
import type { SourceRegistry } from '@/api/types/sources.types'
import { RegistriesSection } from '@/features/sources/components/RegistriesSection'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'registry.title': 'Registries',
        'registry.add': 'Add Registry',
        'registry.namePlaceholder': 'Registry name (optional)',
        'registry.urlPlaceholder': 'Registry URL',
        'registry.connect': 'Connect',
        'registry.default': 'Default',
        'registry.connected': 'Connected',
        'registry.disconnected': 'Disconnected',
        'registry.sourcesCount': `${params?.count || 0} sources`,
        'registry.neverSynced': 'Never synced',
        'registry.lastSynced': `Last synced: ${params?.date || ''} ${params?.time || ''}`,
        'registry.visitSite': 'Visit Site',
        'registry.sync': 'Sync',
        'registry.syncing': 'Syncing...',
        'registry.remove': 'Remove',
      }
      return translations[key] || key
    },
  }),
}))

// Mock common translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'registry.title': 'Registries',
        'registry.add': 'Add Registry',
        'registry.namePlaceholder': 'Registry name (optional)',
        'registry.urlPlaceholder': 'Registry URL',
        'registry.connect': 'Connect',
        'registry.default': 'Default',
        'registry.connected': 'Connected',
        'registry.disconnected': 'Disconnected',
        'registry.sourcesCount': `${params?.count || 0} sources`,
        'registry.neverSynced': 'Never synced',
        'registry.lastSynced': `Last synced: ${params?.date || ''} ${params?.time || ''}`,
        'registry.visitSite': 'Visit Site',
        'registry.sync': 'Sync',
        'registry.syncing': 'Syncing...',
        'registry.remove': 'Remove',
        cancel: 'Cancel',
        loading: 'Loading...',
      }
      return translations[key] || key
    },
  }),
}))

// Mock Card component
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

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    type,
    variant,
    size,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: string
    variant?: string
    size?: string
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      onClick={onClick}
      disabled={disabled}
      type={type as 'button' | 'submit' | undefined}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}))

// Mock Input component
vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
    type,
    required,
  }: {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    type?: string
    required?: boolean
  }) => (
    <input
      data-testid="input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      required={required}
    />
  ),
}))

// Mock Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode
    variant?: string
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

// Mock Dropdown components
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
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <div
      data-testid="dropdown-item"
      onClick={onClick}
      data-disabled={disabled}
      data-variant={variant}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

// Mock Tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}))

const createMockRegistry = (
  overrides: Partial<SourceRegistry> = {},
): SourceRegistry => ({
  id: 'registry-1',
  name: 'ECMWF Registry',
  description: 'Official ECMWF registry',
  url: 'https://registry.ecmwf.int',
  isDefault: false,
  isConnected: true,
  sourcesCount: 5,
  stores: [
    {
      id: 'store-1',
      name: 'HuggingFace Hub',
      url: 'https://huggingface.co',
      type: 'huggingface',
    },
  ],
  lastSyncedAt: '2024-01-15T10:00:00Z',
  ...overrides,
})

describe('RegistriesSection', () => {
  const mockOnAddRegistry = vi.fn()
  const mockOnRemoveRegistry = vi.fn()
  const mockOnSyncRegistry = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      await expect.element(screen.getByText('Registries')).toBeVisible()
    })

    it('renders Add Registry button', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      await expect.element(screen.getByText('Add Registry')).toBeVisible()
    })

    it('renders registry cards', async () => {
      const registries = [createMockRegistry()]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('ECMWF Registry')).toBeVisible()
    })

    it('renders registry URL', async () => {
      const registries = [
        createMockRegistry({ url: 'https://custom.registry.com' }),
      ]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect
        .element(screen.getByText('https://custom.registry.com'))
        .toBeVisible()
    })

    it('renders Default badge for default registry', async () => {
      const registries = [createMockRegistry({ isDefault: true })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('Default')).toBeInTheDocument()
    })

    it('renders sources count', async () => {
      const registries = [createMockRegistry({ sourcesCount: 10 })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('10 sources')).toBeVisible()
    })
  })

  describe('connection status', () => {
    it('shows Connected status for connected registry', async () => {
      const registries = [createMockRegistry({ isConnected: true })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('Connected')).toBeVisible()
    })

    it('shows Disconnected status for disconnected registry', async () => {
      const registries = [createMockRegistry({ isConnected: false })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('Disconnected')).toBeVisible()
    })
  })

  describe('stores display', () => {
    it('renders stores list', async () => {
      const registries = [
        createMockRegistry({
          stores: [
            {
              id: 'store-1',
              name: 'HuggingFace Hub',
              url: 'https://huggingface.co',
              type: 'huggingface',
            },
          ],
        }),
      ]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      // Check for store-related content
      const tooltipTrigger = screen.getByTestId('tooltip-trigger')
      await expect.element(tooltipTrigger).toBeInTheDocument()
    })
  })

  describe('add form', () => {
    it('shows add form when Add Registry button is clicked', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      const addButton = screen.getByText('Add Registry')
      await addButton.click()

      await expect
        .element(screen.getByPlaceholder('Registry URL'))
        .toBeInTheDocument()
    })

    it('shows name and URL inputs in add form', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      const addButton = screen.getByText('Add Registry')
      await addButton.click()

      const inputs = screen.container.querySelectorAll('[data-testid="input"]')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('shows Connect button in add form', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      const addButton = screen.getByText('Add Registry')
      await addButton.click()

      await expect.element(screen.getByText('Connect')).toBeVisible()
    })

    it('shows Cancel button in add form', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      const addButton = screen.getByText('Add Registry')
      await addButton.click()

      await expect.element(screen.getByText('Cancel')).toBeVisible()
    })

    it('hides add form when Cancel is clicked', async () => {
      const screen = await render(
        <RegistriesSection registries={[]} onAddRegistry={mockOnAddRegistry} />,
      )
      const addButton = screen.getByText('Add Registry')
      await addButton.click()

      const cancelButton = screen.getByText('Cancel')
      await cancelButton.click()

      expect(
        screen.container.querySelector('[placeholder="Registry URL"]'),
      ).toBeNull()
    })
  })

  describe('dropdown actions', () => {
    it('renders Visit Site in dropdown', async () => {
      const registries = [createMockRegistry()]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('Visit Site')).toBeInTheDocument()
    })

    it('renders Sync option when onSyncRegistry is provided', async () => {
      const registries = [createMockRegistry()]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
          onSyncRegistry={mockOnSyncRegistry}
        />,
      )
      // Look for Sync within the dropdown content specifically
      const dropdownItems = screen.container.querySelectorAll(
        '[data-testid="dropdown-item"]',
      )
      const hasSyncItem = Array.from(dropdownItems).some((item) => {
        const text = item.textContent
        return text.includes('Sync') && !text.includes('Last synced')
      })
      expect(hasSyncItem).toBe(true)
    })

    it('renders Remove option for non-default registries', async () => {
      const registries = [createMockRegistry({ isDefault: false })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
          onRemoveRegistry={mockOnRemoveRegistry}
        />,
      )
      await expect.element(screen.getByText('Remove')).toBeInTheDocument()
    })

    it('does not render Remove option for default registries', async () => {
      const registries = [createMockRegistry({ isDefault: true })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
          onRemoveRegistry={mockOnRemoveRegistry}
        />,
      )
      expect(screen.container.textContent).not.toContain('Remove')
    })

    it('shows Syncing... when registry is being synced', async () => {
      const registries = [createMockRegistry({ id: 'registry-1' })]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
          onSyncRegistry={mockOnSyncRegistry}
          isSyncingRegistry="registry-1"
        />,
      )
      await expect.element(screen.getByText('Syncing...')).toBeInTheDocument()
    })
  })

  describe('multiple registries', () => {
    it('renders all registries', async () => {
      const registries = [
        createMockRegistry({ id: 'reg-1', name: 'Registry One' }),
        createMockRegistry({ id: 'reg-2', name: 'Registry Two' }),
      ]
      const screen = await render(
        <RegistriesSection
          registries={registries}
          onAddRegistry={mockOnAddRegistry}
        />,
      )
      await expect.element(screen.getByText('Registry One')).toBeVisible()
      await expect.element(screen.getByText('Registry Two')).toBeVisible()
    })
  })
})
