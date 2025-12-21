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
import { Position } from '@xyflow/react'
import { FableEdgeComponent } from '@/features/fable-builder/components/graph-mode/FableEdge'

// Mock state
let mockEdgeStyle: 'bezier' | 'smoothstep' | 'step' = 'bezier'

// Mock useFableBuilderStore
vi.mock('@/features/fable-builder/stores/fableBuilderStore', () => ({
  useFableBuilderStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) => {
    const state = {
      edgeStyle: mockEdgeStyle,
    }
    return selector(state)
  },
}))

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  BaseEdge: ({
    id,
    path,
    className,
  }: {
    id: string
    path: string
    className?: string
  }) => (
    // Wrap path in SVG to avoid React warning about unrecognized tag
    <svg>
      <path
        data-testid={`edge-${id}`}
        d={path}
        className={className}
        data-edge-id={id}
      />
    </svg>
  ),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="edge-label-renderer">{children}</div>
  ),
  getBezierPath: () => ['M0 0 L100 100', 50, 50],
  getSmoothStepPath: () => ['M0 0 L50 50 L100 100', 50, 50],
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
  },
}))

describe('FableEdgeComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEdgeStyle = 'bezier'
  })

  const defaultProps = {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: {},
    selected: false,
  }

  describe('rendering', () => {
    it('renders edge path', async () => {
      const screen = await render(<FableEdgeComponent {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element()).toBeTruthy()
    })

    it('renders with bezier style', async () => {
      mockEdgeStyle = 'bezier'

      const screen = await render(<FableEdgeComponent {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element()).toBeTruthy()
    })

    it('renders with smoothstep style', async () => {
      mockEdgeStyle = 'smoothstep'

      const screen = await render(<FableEdgeComponent {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element()).toBeTruthy()
    })

    it('renders with step style', async () => {
      mockEdgeStyle = 'step'

      const screen = await render(<FableEdgeComponent {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element()).toBeTruthy()
    })
  })

  describe('selection state', () => {
    it('applies primary stroke when selected', async () => {
      const screen = await render(
        <FableEdgeComponent {...defaultProps} selected={true} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      const el = edge.element()
      expect(el).toBeTruthy()
      expect(el.classList.contains('stroke-primary')).toBe(true)
    })

    it('applies muted stroke when not selected', async () => {
      const screen = await render(
        <FableEdgeComponent {...defaultProps} selected={false} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      const el = edge.element()
      expect(el).toBeTruthy()
      expect(el.classList.contains('stroke-muted-foreground')).toBe(true)
    })
  })

  describe('edge labels', () => {
    it('renders label when inputName is provided', async () => {
      const screen = await render(
        <FableEdgeComponent
          {...defaultProps}
          data={{ inputName: 'data_input' }}
        />,
      )

      // Edge label renderer should exist
      const labelRenderer = screen.getByTestId('edge-label-renderer')
      expect(labelRenderer.element()).toBeTruthy()
      await expect.element(screen.getByText('data_input')).toBeInTheDocument()
    })

    it('does not render label when no inputName', async () => {
      const screen = await render(
        <FableEdgeComponent {...defaultProps} data={{}} />,
      )

      const labelRenderer = screen.container.querySelector(
        '[data-testid="edge-label-renderer"]',
      )
      expect(labelRenderer).toBeFalsy()
    })
  })
})
