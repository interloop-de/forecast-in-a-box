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
import { SourceRow } from '@/features/sources/components/SourceRow'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'actions.download': 'Download',
        'actions.retry': 'Retry',
        'actions.enable': 'Enable',
        'actions.disable': 'Disable',
        'actions.viewDetails': 'View Details',
        'actions.remove': 'Remove',
      }
      return translations[key] || key
    },
  }),
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

describe('SourceRow', () => {
  const mockOnViewDetails = vi.fn()
  const mockOnDownload = vi.fn()
  const mockOnToggleEnable = vi.fn()
  const mockOnRemove = vi.fn()
  const mockOnRetry = vi.fn()

  describe('rendering', () => {
    it('renders source details', async () => {
      const source = createMockSource()
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect
        .element(screen.getByText('A test source for testing'))
        .toBeVisible()
    })

    it('renders source plugin name', async () => {
      const source = createMockSource()
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('test-plugin')).toBeVisible()
    })

    it('renders source type badge', async () => {
      const source = createMockSource({ sourceType: 'model' })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('Model')).toBeInTheDocument()
    })

    it('renders dataset type badge', async () => {
      const source = createMockSource({ sourceType: 'dataset' })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('Dataset')).toBeInTheDocument()
    })
  })

  describe('status display', () => {
    it('shows status badge for ready sources', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('shows download progress for downloading sources', async () => {
      const source = createMockSource({
        status: 'downloading',
        downloadProgress: 45,
      })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('45%')).toBeVisible()
    })

    it('shows error status', async () => {
      const source = createMockSource({ status: 'error' })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('shows download button for available sources', async () => {
      const source = createMockSource({ status: 'available' })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onDownload={mockOnDownload}
        />,
      )
      await expect.element(screen.getByText('Download')).toBeVisible()
    })

    it('shows retry button for error sources', async () => {
      const source = createMockSource({ status: 'error' })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRetry={mockOnRetry}
        />,
      )
      await expect.element(screen.getByText('Retry')).toBeVisible()
    })

    it('shows toggle switch for ready sources', async () => {
      const source = createMockSource({ status: 'ready' })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onToggleEnable={mockOnToggleEnable}
        />,
      )
      await expect.element(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('does not show remove button for default sources', async () => {
      const source = createMockSource({ status: 'ready', isDefault: true })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRemove={mockOnRemove}
        />,
      )
      // Default sources should not have remove button visible in the row
      // (only in dropdown)
      expect(screen.container.textContent).not.toContain('Remove')
    })
  })

  describe('callback handlers', () => {
    it('calls onDownload when Download button is clicked', async () => {
      const source = createMockSource({ id: 'source-123', status: 'available' })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onDownload={mockOnDownload}
        />,
      )
      const downloadButton = screen.getByText('Download')
      await downloadButton.click()
      expect(mockOnDownload).toHaveBeenCalledWith('source-123')
    })

    it('calls onRetry when Retry button is clicked', async () => {
      const source = createMockSource({ id: 'source-456', status: 'error' })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRetry={mockOnRetry}
        />,
      )
      const retryButton = screen.getByText('Retry')
      await retryButton.click()
      expect(mockOnRetry).toHaveBeenCalledWith('source-456')
    })

    it('renders toggle switch for ready sources', async () => {
      const source = createMockSource({
        id: 'source-789',
        status: 'ready',
        isEnabled: true,
      })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onToggleEnable={mockOnToggleEnable}
        />,
      )
      const toggle = screen.getByRole('switch')
      await expect.element(toggle).toBeInTheDocument()
    })

    it('calls onRemove when delete button is clicked for non-default ready sources', async () => {
      const source = createMockSource({
        id: 'source-abc',
        status: 'ready',
        isDefault: false,
      })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRemove={mockOnRemove}
        />,
      )
      // Find the delete button (should have Trash2 icon)
      const deleteButtons = screen.container.querySelectorAll('button')
      const deleteButton = Array.from(deleteButtons).find((btn) =>
        btn.className.includes('hover:text-destructive'),
      )
      if (deleteButton) {
        deleteButton.click()
        expect(mockOnRemove).toHaveBeenCalledWith('source-abc')
      }
    })

    it('shows delete button for non-default ready sources', async () => {
      const source = createMockSource({
        status: 'ready',
        isDefault: false,
      })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRemove={mockOnRemove}
        />,
      )
      // Delete button should exist
      const deleteButtons = screen.container.querySelectorAll('button')
      const hasDeleteButton = Array.from(deleteButtons).some((btn) =>
        btn.className.includes('hover:text-destructive'),
      )
      expect(hasDeleteButton).toBe(true)
    })

    it('does not show delete button for non-ready sources', async () => {
      const source = createMockSource({
        status: 'available',
        isDefault: false,
      })
      const screen = await render(
        <SourceRow
          source={source}
          onViewDetails={mockOnViewDetails}
          onRemove={mockOnRemove}
        />,
      )
      // Delete button should not exist
      const deleteButtons = screen.container.querySelectorAll('button')
      const hasDeleteButton = Array.from(deleteButtons).some((btn) =>
        btn.className.includes('hover:text-destructive'),
      )
      expect(hasDeleteButton).toBe(false)
    })
  })

  describe('dropdown menu', () => {
    it('renders dropdown menu trigger', async () => {
      const source = createMockSource()
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      // Dropdown trigger button should be present
      const buttons = screen.container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('download progress', () => {
    it('shows progress bar for downloading sources', async () => {
      const source = createMockSource({
        status: 'downloading',
        downloadProgress: 75,
      })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('75%')).toBeVisible()
    })

    it('rounds progress percentage', async () => {
      const source = createMockSource({
        status: 'downloading',
        downloadProgress: 33.7,
      })
      const screen = await render(
        <SourceRow source={source} onViewDetails={mockOnViewDetails} />,
      )
      await expect.element(screen.getByText('34%')).toBeVisible()
    })
  })
})
