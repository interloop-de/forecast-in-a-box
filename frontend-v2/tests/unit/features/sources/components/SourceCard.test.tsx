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
import type { SourceInfo } from '@/api/types/sources.types'
import { SourceCard } from '@/features/sources/components/SourceCard'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'card.providedBy': `By ${params?.plugin || ''}`,
        'card.size': `Size: ${params?.size || ''}`,
        'status.downloading': 'Downloading',
        'actions.download': 'Download',
        'actions.viewDetails': 'View Details',
        'actions.enable': 'Enable',
        'actions.disable': 'Disable',
        'actions.remove': 'Remove',
        'actions.retry': 'Retry',
      }
      return translations[key] || key
    },
  }),
}))

// Mock child components
vi.mock('@/features/sources/components/SourceStatusBadge', () => ({
  SourceStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}))

vi.mock('@/features/sources/components/SourceTypeBadge', () => ({
  SourceTypeBadge: ({ type }: { type: string }) => (
    <span data-testid="type-badge">{type}</span>
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
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button data-testid="button" onClick={onClick}>
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
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <div data-testid="dropdown-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

const createMockSource = (overrides: Partial<SourceInfo> = {}): SourceInfo => ({
  id: 'test-source',
  factoryId: 'test-factory',
  name: 'Test Source',
  description: 'A test source for testing',
  sourceType: 'model',
  status: 'ready',
  pluginId: 'test-plugin-id',
  pluginName: 'test-plugin',
  author: 'Test Author',
  version: '1.0.0',
  isEnabled: true,
  isDefault: false,
  ...overrides,
})

describe('SourceCard', () => {
  const mockOnViewDetails = vi.fn()
  const mockOnDownload = vi.fn()
  const mockOnToggleEnable = vi.fn()
  const mockOnRetry = vi.fn()

  describe('rendering', () => {
    it('renders source name', async () => {
      const source = createMockSource({ name: 'My Source' })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByText('My Source')).toBeVisible()
    })

    it('renders source description for ready status', async () => {
      const source = createMockSource({
        status: 'ready',
        description: 'Source description here',
      })
      const screen = await render(<SourceCard source={source} />)
      await expect
        .element(screen.getByText('Source description here'))
        .toBeVisible()
    })

    it('renders plugin name', async () => {
      const source = createMockSource({ pluginName: 'aifs-plugin' })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByText(/By aifs-plugin/)).toBeVisible()
    })

    it('renders status badge', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(<SourceCard source={source} />)
      await expect
        .element(screen.getByTestId('status-badge'))
        .toBeInTheDocument()
    })

    it('renders type badge', async () => {
      const source = createMockSource({ sourceType: 'model' })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByTestId('type-badge')).toBeInTheDocument()
    })
  })

  describe('download progress', () => {
    it('shows progress bar when downloading', async () => {
      const source = createMockSource({
        status: 'downloading',
        downloadProgress: 45,
      })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByText('45%')).toBeVisible()
    })

    it('shows downloading status text', async () => {
      const source = createMockSource({ status: 'downloading' })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByText('Downloading...')).toBeVisible()
    })
  })

  describe('error state', () => {
    it('shows error message when status is error', async () => {
      const source = createMockSource({
        status: 'error',
        downloadError: 'Failed to download',
      })
      const screen = await render(<SourceCard source={source} />)
      await expect.element(screen.getByText('Failed to download')).toBeVisible()
    })

    it('shows retry button for error status', async () => {
      const source = createMockSource({ status: 'error' })
      const screen = await render(
        <SourceCard source={source} onRetry={mockOnRetry} />,
      )
      await expect.element(screen.getByText('Retry')).toBeVisible()
    })
  })

  describe('actions', () => {
    it('shows Download button for available sources', async () => {
      const source = createMockSource({ status: 'available' })
      const screen = await render(
        <SourceCard source={source} onDownload={mockOnDownload} />,
      )
      await expect.element(screen.getByText('Download')).toBeVisible()
    })

    it('shows View Details button for ready sources', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(
        <SourceCard source={source} onViewDetails={mockOnViewDetails} />,
      )
      // Use getByRole to get the button specifically (not the dropdown item)
      const buttons = screen.container.querySelectorAll('button')
      const viewDetailsButton = Array.from(buttons).find(
        (btn) => btn.textContent && btn.textContent.includes('View Details'),
      )
      expect(viewDetailsButton).toBeTruthy()
    })

    it('shows toggle switch for ready sources', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(
        <SourceCard source={source} onToggleEnable={mockOnToggleEnable} />,
      )
      await expect.element(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('does not show toggle switch for non-ready sources', async () => {
      const source = createMockSource({ status: 'available' })
      const screen = await render(<SourceCard source={source} />)
      expect(screen.container.querySelector('[role="switch"]')).toBeNull()
    })
  })

  describe('callback handlers', () => {
    const mockOnRemove = vi.fn()

    it('calls onDownload when Download button is clicked', async () => {
      const source = createMockSource({ id: 'source-123', status: 'available' })
      const screen = await render(
        <SourceCard source={source} onDownload={mockOnDownload} />,
      )
      const downloadButton = screen.getByText('Download')
      await downloadButton.click()
      expect(mockOnDownload).toHaveBeenCalledWith('source-123')
    })

    it('calls onRetry when Retry button is clicked', async () => {
      const source = createMockSource({ id: 'source-456', status: 'error' })
      const screen = await render(
        <SourceCard source={source} onRetry={mockOnRetry} />,
      )
      const retryButton = screen.getByText('Retry')
      await retryButton.click()
      expect(mockOnRetry).toHaveBeenCalledWith('source-456')
    })

    it('calls onViewDetails when View Details button is clicked', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(
        <SourceCard source={source} onViewDetails={mockOnViewDetails} />,
      )
      // Find the button that contains View Details text
      const buttons = screen.container.querySelectorAll('button')
      const viewDetailsButton = Array.from(buttons).find(
        (btn) => btn.textContent && btn.textContent.includes('View Details'),
      )
      if (viewDetailsButton) {
        viewDetailsButton.click()
        expect(mockOnViewDetails).toHaveBeenCalledWith(source)
      }
    })

    it('calls onToggleEnable when toggle switch is changed', async () => {
      const source = createMockSource({
        id: 'source-789',
        status: 'ready',
        isEnabled: true,
      })
      const screen = await render(
        <SourceCard source={source} onToggleEnable={mockOnToggleEnable} />,
      )
      const toggle = screen.getByRole('switch')
      await toggle.click()
      expect(mockOnToggleEnable).toHaveBeenCalledWith('source-789', false)
    })

    it('shows Remove option in dropdown for ready non-default sources', async () => {
      const source = createMockSource({
        status: 'ready',
        isDefault: false,
      })
      const screen = await render(
        <SourceCard source={source} onRemove={mockOnRemove} />,
      )
      await expect.element(screen.getByText('Remove')).toBeInTheDocument()
    })

    it('does not show Remove option for default sources', async () => {
      const source = createMockSource({
        status: 'ready',
        isDefault: true,
      })
      const screen = await render(
        <SourceCard source={source} onRemove={mockOnRemove} />,
      )
      // Remove should not be in the document for default sources
      expect(screen.container.textContent).not.toContain('Remove')
    })

    it('does not show Remove option for non-ready sources', async () => {
      const source = createMockSource({
        status: 'available',
        isDefault: false,
      })
      const screen = await render(
        <SourceCard source={source} onRemove={mockOnRemove} />,
      )
      // Remove should not be in the document for non-ready sources
      expect(screen.container.textContent).not.toContain('Remove')
    })
  })

  describe('dropdown menu', () => {
    it('renders View Details in dropdown', async () => {
      const source = createMockSource()
      const screen = await render(
        <SourceCard source={source} onViewDetails={mockOnViewDetails} />,
      )
      // Should find View Details in the dropdown content
      const dropdownItems = screen.container.querySelectorAll(
        '[data-testid="dropdown-item"]',
      )
      const hasViewDetails = Array.from(dropdownItems).some(
        (item) => item.textContent && item.textContent.includes('View Details'),
      )
      expect(hasViewDetails).toBe(true)
    })
  })
})
