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
import { BlockNode } from '@/features/fable-builder/components/graph-mode/nodes/BlockNode'
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
  'test-plugin': {
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

const mockFactory = mockCatalogue['test-plugin'].factories['source-factory']
const mockTransformFactory =
  mockCatalogue['test-plugin'].factories['transform-factory']
const mockSinkFactory = mockCatalogue['test-plugin'].factories['sink-factory']

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

describe('BlockNode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: { blocks: {} },
      selectedBlockId: null,
      validationState: null,
      layoutDirection: 'TB',
    })
  })

  describe('rendering', () => {
    it('renders factory title', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Test Source')
    })

    it('renders factory description', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('A test source block')
    })

    it('renders kind label', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('Source')
    })

    it('renders config values as badges', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: { param1: 'test-value' },
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('test-value')
    })

    it('truncates long config values', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {
                param1: 'this-is-a-very-long-value-that-should-be-truncated',
              },
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      expect(screen.container.textContent).toContain('...')
    })
  })

  describe('handles', () => {
    it('renders output handle for non-sink blocks', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('handle-source-output'))
        .toBeInTheDocument()
    })

    it('does not render output handle for sink blocks', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Sink',
            factory: mockSinkFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'sink-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sinkBlock"
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
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Transform',
            factory: mockTransformFactory,
            instance: {
              factory_id: {
                plugin: 'test-plugin',
                factory: 'transform-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="transformBlock"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('handle-target-input'))
        .toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('calls selectBlock when clicked', async () => {
      const selectBlockSpy = vi.fn()
      useFableBuilderStore.setState({ selectBlock: selectBlockSpy })

      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      // Click on the node
      const nodeContainer = screen.container.querySelector('.rounded-2xl')
      if (nodeContainer) await (nodeContainer as HTMLElement).click()

      expect(selectBlockSpy).toHaveBeenCalledWith('block-1')
    })

    it('renders without error when selected', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
          selected={true}
        />,
      )

      // Node should render properly
      expect(screen.container.textContent).toContain('Test Source')
    })

    it('renders without error when selectedBlockId matches', async () => {
      useFableBuilderStore.setState({ selectedBlockId: 'block-1' })

      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      // Node should render properly
      expect(screen.container.textContent).toContain('Test Source')
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
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
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
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Source',
            factory: mockFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sourceBlock"
          {...defaultNodeProps}
        />,
      )

      await expect
        .element(screen.getByTestId('add-node-button'))
        .toBeInTheDocument()
    })

    it('does not render AddNodeButton for sink blocks', async () => {
      const screen = await render(
        <BlockNode
          id="block-1"
          data={{
            instanceId: 'block-1',
            label: 'Test Sink',
            factory: mockSinkFactory,
            instance: {
              factory_id: { plugin: 'test-plugin', factory: 'sink-factory' },
              configuration_values: {},
              input_ids: {},
            },
            catalogue: mockCatalogue,
          }}
          type="sinkBlock"
          {...defaultNodeProps}
        />,
      )

      const addButton = screen.container.querySelector(
        '[data-testid="add-node-button"]',
      )
      expect(addButton).toBeNull()
    })
  })
})
