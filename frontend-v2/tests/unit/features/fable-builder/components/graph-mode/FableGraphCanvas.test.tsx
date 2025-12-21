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
import { FableGraphCanvas } from '@/features/fable-builder/components/graph-mode/FableGraphCanvas'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock ReactFlow and its components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({
    children,
    nodes,
    edges,
  }: {
    children?: React.ReactNode
    nodes?: Array<unknown>
    edges?: Array<unknown>
  }) => (
    <div
      data-testid="react-flow"
      data-nodes={nodes?.length}
      data-edges={edges?.length}
    >
      {children}
    </div>
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-provider">{children}</div>
  ),
  Background: ({ variant }: { variant: string }) => (
    <div data-testid="background" data-variant={variant}>
      Background
    </div>
  ),
  BackgroundVariant: {
    Dots: 'dots',
    Lines: 'lines',
    Cross: 'cross',
  },
  MiniMap: ({ position }: { position?: string }) => (
    <div data-testid="minimap" data-position={position}>
      MiniMap
    </div>
  ),
  Handle: ({ id, type }: { id: string; type: string }) => (
    <div data-testid={`handle-${type}-${id}`}>Handle</div>
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
  BaseEdge: () => <path data-testid="base-edge" />,
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="edge-label-renderer">{children}</div>
  ),
  getSmoothStepPath: () => ['M0,0', 0, 0],
  getBezierPath: () => ['M0,0', 0, 0],
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  useReactFlow: () => ({
    fitView: vi.fn(),
    setViewport: vi.fn(),
    setNodes: vi.fn(),
    setEdges: vi.fn(),
  }),
  addEdge: vi.fn((edge, edges) => [...edges, edge]),
  getNodesBounds: vi.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
}))

// Mock layout-blocks utility
vi.mock('@/features/fable-builder/utils/layout-blocks', () => ({
  layoutNodes: vi.fn((nodes) => nodes),
  needsLayout: vi.fn(() => false),
}))

// Mock fable-to-graph utility
vi.mock('@/features/fable-builder/utils/fable-to-graph', () => ({
  fableToGraph: vi.fn(() => ({ nodes: [], edges: [] })),
}))

// Mock useMedia hook
vi.mock('@/hooks/useMedia', () => ({
  useMedia: () => true,
}))

// Mock useDebouncedCallback
vi.mock('@/hooks/useDebounce', () => ({
  useDebouncedCallback: (fn: () => void) => fn,
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source block',
        configuration_options: {},
        inputs: [],
      },
    },
  },
}

describe('FableGraphCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: { blocks: {} },
      autoLayout: true,
      layoutDirection: 'TB',
      nodesLocked: false,
      isMiniMapOpen: true,
      fitViewTrigger: 0,
      selectedBlockId: null,
      validationState: null,
      connectBlocks: vi.fn(),
      selectBlock: vi.fn(),
    })
  })

  describe('rendering', () => {
    it('renders ReactFlow provider', async () => {
      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      await expect
        .element(screen.getByTestId('react-flow-provider'))
        .toBeInTheDocument()
    })

    it('renders ReactFlow component', async () => {
      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByTestId('react-flow')).toBeInTheDocument()
    })

    it('renders background with dots variant', async () => {
      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      const background = screen.getByTestId('background')
      await expect.element(background).toBeInTheDocument()
      expect(background.element().dataset.variant).toBe('dots')
    })

    it('renders minimap by default', async () => {
      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByTestId('minimap')).toBeInTheDocument()
    })
  })

  describe('integration with store', () => {
    it('reads fable from store', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-1': {
              factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      // Should render without error
      await expect.element(screen.getByTestId('react-flow')).toBeInTheDocument()
    })

    it('reads layoutDirection from store', async () => {
      useFableBuilderStore.setState({
        layoutDirection: 'LR',
      })

      const screen = await render(
        <FableGraphCanvas catalogue={mockCatalogue} />,
      )

      // Should render without error
      await expect.element(screen.getByTestId('react-flow')).toBeInTheDocument()
    })
  })
})
