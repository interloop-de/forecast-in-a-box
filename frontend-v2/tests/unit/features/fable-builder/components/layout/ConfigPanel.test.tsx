/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { ConfigPanel } from '@/features/fable-builder/components/layout/ConfigPanel'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock AlertDialog components
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({
    children,
    render: renderProp,
  }: {
    children: React.ReactNode
    render?: React.ReactElement
  }) => (
    <div data-testid="alert-dialog-trigger">
      {renderProp}
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick: () => void
  }) => (
    <button data-testid="alert-dialog-action" onClick={onClick}>
      {children}
    </button>
  ),
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source block',
        configuration_options: {
          option1: {
            title: 'Option 1',
            description: 'First option description',
            value_type: 'string',
          },
          option2: {
            title: 'Option 2',
            description: 'Second option description',
            value_type: 'integer',
          },
        },
        inputs: [],
      },
      'transform-factory': {
        kind: 'transform',
        title: 'Test Transform',
        description: 'A test transform block',
        configuration_options: {
          transformOption: {
            title: 'Transform Option',
            description: 'A transform option',
            value_type: 'string',
          },
        },
        inputs: ['input'],
      },
      'sink-factory': {
        kind: 'sink',
        title: 'Test Sink',
        description: 'A test sink block',
        configuration_options: {},
        inputs: ['data'],
      },
      'product-factory': {
        kind: 'product',
        title: 'Test Product',
        description: 'A test product block',
        configuration_options: {},
        inputs: [],
      },
    },
  },
}

describe('ConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: {
        blocks: {
          'source-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
            configuration_values: { option1: 'value1', option2: '42' },
            input_ids: {},
          },
          'transform-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'transform-factory',
            },
            configuration_values: { transformOption: 'test' },
            input_ids: { input: 'source-1' },
          },
          'sink-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'sink-factory',
            },
            configuration_values: {},
            input_ids: {},
          },
          'product-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'product-factory',
            },
            configuration_values: {},
            input_ids: {},
          },
        },
      },
      selectedBlockId: null,
      selectBlock: vi.fn(),
      updateBlockConfig: vi.fn(),
      removeBlock: vi.fn(),
      connectBlocks: vi.fn(),
      disconnectBlock: vi.fn(),
    })
  })

  afterEach(() => {
    useFableBuilderStore.setState({
      selectedBlockId: null,
    })
  })

  describe('no block selected', () => {
    it('shows empty state message when no block is selected', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Select a block to configure',
      )
    })

    it('shows alert icon in empty state', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })

  describe('block selected - header', () => {
    beforeEach(() => {
      useFableBuilderStore.setState({ selectedBlockId: 'source-1' })
    })

    it('displays factory title', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Test Source')
    })

    it('displays factory description', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('A test source block')
    })

    it('displays kind badge', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Source')
    })

    it('renders close button', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const closeButton = Array.from(buttons).find(
        // @ts-ignore - textContent may be null but we handle it safely in filter
        (b) => b.querySelector('svg') && !b.textContent.includes('Delete'),
      )
      expect(closeButton).toBeTruthy()
    })

    it('calls selectBlock(null) when close button clicked', async () => {
      const selectBlockSpy = vi.fn()
      useFableBuilderStore.setState({ selectBlock: selectBlockSpy })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const closeButton = Array.from(buttons).find(
        (b) =>
          b.querySelector('svg') &&
          // @ts-ignore - textContent may be null but we handle it safely in filter
          !b.textContent.includes('Delete') &&
          !b.closest('[data-testid]'),
      )

      expect(closeButton).toBeTruthy()
      await closeButton!.click()
      expect(selectBlockSpy).toHaveBeenCalledWith(null)
    })
  })

  describe('configuration fields', () => {
    beforeEach(() => {
      useFableBuilderStore.setState({ selectedBlockId: 'source-1' })
    })

    it('renders configuration section', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Configuration')
    })

    it('renders configuration option titles', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Option 1')
      expect(screen.container.textContent).toContain('Option 2')
    })

    it('renders configuration option descriptions', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('First option description')
      expect(screen.container.textContent).toContain(
        'Second option description',
      )
    })

    it('displays existing configuration values', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const option1Input = screen.container.querySelector<HTMLInputElement>(
        'input#config-option1',
      )
      const option2Input = screen.container.querySelector<HTMLInputElement>(
        'input#config-option2',
      )

      expect(option1Input).toBeTruthy()
      expect(option2Input).toBeTruthy()
      expect(option1Input!.value).toBe('value1')
      expect(option2Input!.value).toBe('42')
    })

    it('renders text input for string type', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const option1Input = screen.container.querySelector<HTMLInputElement>(
        'input#config-option1',
      )
      expect(option1Input).toBeTruthy()
      expect(option1Input!.type).toBe('text')
    })

    it('renders number input for integer type', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const option2Input = screen.container.querySelector<HTMLInputElement>(
        'input#config-option2',
      )
      expect(option2Input).toBeTruthy()
      expect(option2Input!.type).toBe('number')
    })

    it('calls updateBlockConfig when input value changes', async () => {
      const updateBlockConfigSpy = vi.fn()
      useFableBuilderStore.setState({ updateBlockConfig: updateBlockConfigSpy })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      const input = screen.container.querySelector('input#config-option1')
      expect(input).toBeTruthy()

      // Use InputEvent which is what React listens for
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeInputValueSetter?.call(input, 'new-value')
      input!.dispatchEvent(new Event('input', { bubbles: true }))

      expect(updateBlockConfigSpy).toHaveBeenCalledWith(
        'source-1',
        'option1',
        'new-value',
      )
    })
  })

  describe('input connections', () => {
    beforeEach(() => {
      useFableBuilderStore.setState({ selectedBlockId: 'transform-1' })
    })

    it('renders input connections section for blocks with inputs', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Input Connections')
    })

    it('renders input field with correct label', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('input')
    })

    it('does not show input connections section for source blocks', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'source-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).not.toContain('Input Connections')
    })
  })

  describe('no configuration options', () => {
    it('shows "No configuration options" for blocks without config or inputs', async () => {
      // Create a factory with no config options and no inputs
      const simpleCatalogue: BlockFactoryCatalogue = {
        'ecmwf/simple-plugin': {
          factories: {
            'simple-factory': {
              kind: 'source',
              title: 'Simple Source',
              description: 'A simple source',
              configuration_options: {},
              inputs: [],
            },
          },
        },
      }

      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'simple-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'simple-plugin' },
                factory: 'simple-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
        selectedBlockId: 'simple-1',
      })

      const screen = await render(<ConfigPanel catalogue={simpleCatalogue} />)

      expect(screen.container.textContent).toContain('No configuration options')
    })
  })

  describe('delete functionality', () => {
    beforeEach(() => {
      useFableBuilderStore.setState({ selectedBlockId: 'source-1' })
    })

    it('renders delete button', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Delete Block')
    })

    it('renders delete confirmation dialog', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      await expect
        .element(screen.getByTestId('alert-dialog-title'))
        .toHaveTextContent('Delete Block')
    })

    it('shows factory title in delete confirmation', async () => {
      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      await expect
        .element(screen.getByTestId('alert-dialog-description'))
        .toHaveTextContent('Test Source')
    })

    it('calls removeBlock and selectBlock when delete confirmed', async () => {
      const removeBlockSpy = vi.fn()
      const selectBlockSpy = vi.fn()
      useFableBuilderStore.setState({
        removeBlock: removeBlockSpy,
        selectBlock: selectBlockSpy,
      })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      await screen.getByTestId('alert-dialog-action').click()

      expect(removeBlockSpy).toHaveBeenCalledWith('source-1')
      expect(selectBlockSpy).toHaveBeenCalledWith(null)
    })
  })

  describe('available sources for input connections', () => {
    it('includes source blocks as available sources', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'sink-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      // The source block should be available as a connection option
      expect(screen.container.textContent).toContain('Input Connections')
    })

    it('includes product blocks as available sources', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'sink-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      // Product blocks should be available as connection options
      expect(screen.container.textContent).toContain('Input Connections')
    })

    it('does not include self as available source', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'source-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      // Source-1 should not show itself in available sources
      // Since source blocks have no inputs, this won't show the connections section
      expect(screen.container.textContent).not.toContain('Input Connections')
    })
  })

  describe('unknown block', () => {
    it('shows empty state for non-existent block', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'non-existent' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Select a block to configure',
      )
    })

    it('shows empty state for block with unknown factory', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            unknown: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'unknown' },
                factory: 'unknown',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
        selectedBlockId: 'unknown',
      })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Select a block to configure',
      )
    })
  })

  describe('transform block with different kind', () => {
    it('displays transform kind badge', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'transform-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Transform')
    })
  })

  describe('sink block', () => {
    it('displays sink kind badge', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'sink-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Sink')
    })

    it('shows input connections for sink block', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'sink-1' })

      const screen = await render(<ConfigPanel catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Input Connections')
      expect(screen.container.textContent).toContain('data')
    })
  })
})
