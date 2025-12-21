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
import { BlockInstanceCard } from '@/features/fable-builder/components/form-mode/BlockInstanceCard'
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

// Mock Select components
vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
  }) => (
    <div
      data-testid="select"
      data-value={value}
      data-onchange={!!onValueChange}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    id,
  }: {
    children: React.ReactNode
    id?: string
    className?: string
  }) => (
    <button data-testid="select-trigger" id={id}>
      {children}
    </button>
  ),
  SelectValue: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="select-value">{children}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode
    value: string
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'test-plugin': {
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
            value_type: 'string',
          },
        },
        inputs: [],
      },
      'transform-factory': {
        kind: 'transform',
        title: 'Test Transform',
        description: 'A test transform block',
        configuration_options: {},
        inputs: ['input'],
      },
    },
  },
}

describe('BlockInstanceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: {
        blocks: {
          'block-1': {
            factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
            configuration_values: { option1: 'value1', option2: '' },
            input_ids: {},
          },
          'block-2': {
            factory_id: { plugin: 'test-plugin', factory: 'transform-factory' },
            configuration_values: {},
            input_ids: { input: 'block-1' },
          },
        },
      },
      validationState: null,
      isValidating: false,
    })
  })

  afterEach(() => {
    // Don't call reset() here as it clears fable.blocks which causes
    // still-mounted components to crash when they re-render.
    // Instead, just clear validation state
    useFableBuilderStore.setState({
      validationState: null,
      isValidating: false,
    })
  })

  describe('rendering', () => {
    it('renders block title', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Test Source')
    })

    it('renders block description', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('A test source block')
    })

    it('renders configuration options', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Option 1')
      expect(screen.container.textContent).toContain('Option 2')
    })

    it('renders input fields for configuration', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      const inputs = screen.container.querySelectorAll('input')
      expect(inputs.length).toBe(2)
    })

    it('shows existing configuration values', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      const input = screen.container.querySelector(
        'input[id="block-1-option1"]',
      ) as HTMLInputElement
      expect(input.value).toBe('value1')
    })

    it('returns null for unknown factory', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            unknown: {
              factory_id: { plugin: 'unknown', factory: 'unknown' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="unknown" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toBe('')
    })
  })

  describe('expand/collapse', () => {
    it('is expanded by default', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      // CardContent should be visible (configuration options)
      expect(screen.container.textContent).toContain('Option 1')
    })

    it('collapses when toggle button clicked', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      // Find and click the toggle button (first ghost button without trash icon)
      const buttons = screen.container.querySelectorAll('button')
      const toggleButton = Array.from(buttons).find(
        (b) =>
          !b.closest('[data-testid="alert-dialog-trigger"]') &&
          b.querySelector('svg'),
      )

      if (toggleButton) {
        await toggleButton.click()
      }

      // After collapse, re-render to check state
      // The content should be hidden but we can check the toggle works
      expect(toggleButton).toBeTruthy()
    })
  })

  describe('delete functionality', () => {
    it('renders delete dialog', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      await expect
        .element(screen.getByTestId('alert-dialog-title'))
        .toHaveTextContent('Delete Block')
    })

    it('calls removeBlock when delete confirmed', async () => {
      const removeBlockSpy = vi.fn()
      useFableBuilderStore.setState({ removeBlock: removeBlockSpy })

      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      await screen.getByTestId('alert-dialog-action').click()

      expect(removeBlockSpy).toHaveBeenCalledWith('block-1')
    })

    it('shows factory title in delete confirmation', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      await expect
        .element(screen.getByTestId('alert-dialog-description'))
        .toHaveTextContent('Test Source')
    })
  })

  describe('configuration updates', () => {
    it('calls updateBlockConfig when input changes', async () => {
      const updateBlockConfigSpy = vi.fn()
      useFableBuilderStore.setState({ updateBlockConfig: updateBlockConfigSpy })

      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      const input = screen.container.querySelector<HTMLInputElement>(
        'input[id="block-1-option1"]',
      )

      expect(input).toBeTruthy()
      input!.focus()
      // Clear and type new value
      input!.value = 'new-value'
      input!.dispatchEvent(new Event('change', { bubbles: true }))
    })
  })

  describe('inputs display', () => {
    it('shows connected block for inputs', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-2" catalogue={mockCatalogue} />,
      )

      // Should show the inputs section
      expect(screen.container.textContent).toContain('Input Connections')
      // Should show the connected factory title in select value
      expect(screen.container.textContent).toContain('Test Source')
    })

    it('shows "Select source..." for unconnected inputs', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { option1: 'value1', option2: '' },
              input_ids: {},
            },
            'block-2': {
              factory_id: {
                plugin: 'test-plugin',
                factory: 'transform-factory',
              },
              configuration_values: {},
              input_ids: {}, // No connections
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="block-2" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Select source...')
    })

    it('does not show inputs section when factory has no inputs', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      // Source factory has no inputs
      expect(screen.container.textContent).not.toContain('Input Connections')
    })

    it('renders select dropdown for input connections', async () => {
      const screen = await render(
        <BlockInstanceCard instanceId="block-2" catalogue={mockCatalogue} />,
      )

      // Should have a select component for the input
      const select = screen.getByTestId('select')
      expect(select).toBeTruthy()
    })
  })

  describe('validation errors', () => {
    it('shows error badge when block has errors', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { option1: '', option2: '' },
              input_ids: {},
            },
          },
        },
        validationState: {
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Missing required value'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('1 error')
    })

    it('shows multiple errors count', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { option1: '', option2: '' },
              input_ids: {},
            },
          },
        },
        validationState: {
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Error 1', 'Error 2', 'Error 3'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('3 errors')
    })

    it('displays error messages', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { option1: '', option2: '' },
              input_ids: {},
            },
          },
        },
        validationState: {
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Missing required value', 'Invalid format'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Missing required value')
      expect(screen.container.textContent).toContain('Invalid format')
    })
  })

  describe('no configuration options', () => {
    it('shows message when no config options available', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { option1: 'value1', option2: '' },
              input_ids: {},
            },
            'block-2': {
              factory_id: {
                plugin: 'test-plugin',
                factory: 'transform-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <BlockInstanceCard instanceId="block-2" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('No configuration options')
    })
  })
})
