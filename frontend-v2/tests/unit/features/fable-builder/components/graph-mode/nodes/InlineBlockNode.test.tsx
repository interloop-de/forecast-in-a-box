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
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { InlineBlockNode } from '@/features/fable-builder/components/graph-mode/nodes/InlineBlockNode'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock ReactFlow components
vi.mock('@xyflow/react', () => ({
  Handle: ({
    id,
    type,
    position,
  }: {
    id: string
    type: string
    position: string
  }) => (
    <div data-testid={`handle-${type}-${id}`} data-position={position}>
      Handle
    </div>
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
}))

// Mock useNodeDimensions
vi.mock('@/features/fable-builder/hooks/useNodeDimensions', () => ({
  useNodeDimensions: () => ({ current: null }),
}))

// Mock AddNodeButton
vi.mock('@/features/fable-builder/components/graph-mode/AddNodeButton', () => ({
  AddNodeButton: () => <div data-testid="add-node-button">Add</div>,
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source block',
        configuration_options: {
          param1: {
            title: 'Param 1',
            description: 'Parameter 1',
            value_type: 'string',
          },
          param2: {
            title: 'Param 2',
            description: 'Parameter 2',
            value_type: 'integer',
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
      'sink-factory': {
        kind: 'sink',
        title: 'Test Sink',
        description: 'A test sink block',
        configuration_options: {},
        inputs: ['data'],
      },
    },
  },
}

const mockFactory =
  mockCatalogue['ecmwf/test-plugin'].factories['source-factory']
const mockTransformFactory =
  mockCatalogue['ecmwf/test-plugin'].factories['transform-factory']
const mockSinkFactory =
  mockCatalogue['ecmwf/test-plugin'].factories['sink-factory']

// Default node props required by NodeProps type
const defaultNodeProps = {
  selected: false,
  isConnectable: true,
  positionAbsoluteX: 0,
  positionAbsoluteY: 0,
  zIndex: 0,
  draggable: true,
  dragging: false,
  selectable: true,
  deletable: true,
}

describe('InlineBlockNode', () => {
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
            configuration_values: {},
            input_ids: {},
          },
        },
      },
      selectedBlockId: null,
      validationState: null,
    })
  })

  describe('rendering', () => {
    it('renders factory title', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Test Source')
    })

    it('renders factory description', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('A test source block')
    })

    it('renders kind label', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Source')
    })
  })

  describe('configuration fields', () => {
    it('renders configuration field inputs', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      // Configuration section should be visible
      expect(screen.container.textContent).toContain('Configuration')
      expect(screen.container.textContent).toContain('Param 1')
      expect(screen.container.textContent).toContain('Param 2')
    })

    it('renders configuration field descriptions', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Parameter 1')
      expect(screen.container.textContent).toContain('Parameter 2')
    })
  })

  describe('input connections', () => {
    it('renders input section for blocks with inputs', async () => {
      const screen = await render(
        <InlineBlockNode
          id="transform-1"
          data={{
            instanceId: 'transform-1',
            label: 'Test Transform',
            factory: mockTransformFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'transform-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="transformBlockInline"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Inputs')
      expect(screen.container.textContent).toContain('input')
    })

    it('does not render input section for source blocks', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      // Source blocks have no inputs
      expect(screen.container.textContent).not.toContain('Inputs')
    })
  })

  describe('handles', () => {
    it('renders output handle for non-sink blocks', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('handle-source-output'))
        .toBeInTheDocument()
    })

    it('does not render output handle for sink blocks', async () => {
      const screen = await render(
        <InlineBlockNode
          id="sink-1"
          data={{
            instanceId: 'sink-1',
            label: 'Test Sink',
            factory: mockSinkFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'sink-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sinkBlockInline"
          {...defaultNodeProps}
        />,
      )

      const outputHandle = screen.container.querySelector(
        '[data-testid="handle-source-output"]',
      )
      expect(outputHandle).toBeNull()
    })

    it('renders input handles for blocks with inputs', async () => {
      const screen = await render(
        <InlineBlockNode
          id="transform-1"
          data={{
            instanceId: 'transform-1',
            label: 'Test Transform',
            factory: mockTransformFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'transform-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="transformBlockInline"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('handle-target-input'))
        .toBeInTheDocument()
    })
  })

  describe('validation errors', () => {
    it('shows error indicator when block has errors', async () => {
      useFableBuilderStore.setState({
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
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      // Error indicator should be present
      const errorIndicator = screen.container.querySelector('.bg-destructive')
      expect(errorIndicator).toBeTruthy()
    })
  })

  describe('add node button', () => {
    it('renders AddNodeButton for non-sink blocks', async () => {
      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('add-node-button'))
        .toBeInTheDocument()
    })

    it('does not render AddNodeButton for sink blocks', async () => {
      const screen = await render(
        <InlineBlockNode
          id="sink-1"
          data={{
            instanceId: 'sink-1',
            label: 'Test Sink',
            factory: mockSinkFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'sink-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sinkBlockInline"
          {...defaultNodeProps}
        />,
      )

      const addButton = screen.container.querySelector(
        '[data-testid="add-node-button"]',
      )
      expect(addButton).toBeNull()
    })
  })

  describe('selection', () => {
    it('calls selectBlock when clicked', async () => {
      const selectBlockSpy = vi.fn()
      useFableBuilderStore.setState({ selectBlock: selectBlockSpy })

      const screen = await render(
        <InlineBlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlockInline"
          {...defaultNodeProps}
        />,
      )

      // Click on the node
      const nodeContainer = screen.container.querySelector('.rounded-2xl')
      if (nodeContainer) await (nodeContainer as HTMLElement).click()

      expect(selectBlockSpy).toHaveBeenCalledWith('block-1')
    })
  })
})
