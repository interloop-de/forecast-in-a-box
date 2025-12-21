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
import type { Position } from '@xyflow/react'
import { DataEdge } from '@/components/data-edge'

// Mock @xyflow/react
vi.mock('@xyflow/react', () => {
  const mockNodeLookup = new Map([
    [
      'source-1',
      { data: { label: 'Test Label', count: 42, config: { key: 'value' } } },
    ],
  ])

  return {
    BaseEdge: ({
      id,
      path,
      markerEnd,
      style,
    }: {
      id: string
      path: string
      markerEnd?: string
      style?: React.CSSProperties
    }) => (
      <svg>
        <path
          data-testid={`edge-${id}`}
          d={path}
          data-marker-end={markerEnd}
          style={style}
        />
      </svg>
    ),
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="edge-label-renderer">{children}</div>
    ),
    getBezierPath: () =>
      ['M0 0 C50 0, 50 100, 100 100', 50, 50, 0, 0] as [
        string,
        number,
        number,
        number,
        number,
      ],
    getSmoothStepPath: () =>
      ['M0 0 L50 0 L50 100 L100 100', 50, 50, 0, 0] as [
        string,
        number,
        number,
        number,
        number,
      ],
    getStraightPath: () =>
      ['M0 0 L100 100', 50, 50, 0, 0] as [
        string,
        number,
        number,
        number,
        number,
      ],
    useStore: (
      selector: (state: {
        nodeLookup: Map<string, { data: Record<string, unknown> }>
      }) => unknown,
    ) => {
      return selector({ nodeLookup: mockNodeLookup })
    },
    Position: {
      Top: 'top' as Position,
      Bottom: 'bottom' as Position,
      Left: 'left' as Position,
      Right: 'right' as Position,
    },
  }
})

describe('DataEdge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const defaultProps = {
    id: 'edge-1',
    source: 'source-1',
    target: 'target-1',
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: 'bottom' as Position,
    targetPosition: 'top' as Position,
  }

  describe('rendering', () => {
    it('renders edge path', async () => {
      const screen = await render(<DataEdge {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element()).toBeTruthy()
    })

    it('renders with default bezier path', async () => {
      const screen = await render(<DataEdge {...defaultProps} />)

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('d')).toBe(
        'M0 0 C50 0, 50 100, 100 100',
      )
    })

    it('renders with smoothstep path', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ path: 'smoothstep' }} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('d')).toBe(
        'M0 0 L50 0 L50 100 L100 100',
      )
    })

    it('renders with step path', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ path: 'step' }} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      // Step uses smoothstep with borderRadius: 0
      expect(edge.element().getAttribute('d')).toBe(
        'M0 0 L50 0 L50 100 L100 100',
      )
    })

    it('renders with straight path', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ path: 'straight' }} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('d')).toBe('M0 0 L100 100')
    })

    it('applies marker end', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} markerEnd="url(#arrow)" />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('data-marker-end')).toBe('url(#arrow)')
    })

    it('applies custom style', async () => {
      const screen = await render(
        <DataEdge
          {...defaultProps}
          style={{ strokeWidth: 2, stroke: 'red' }}
        />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      const el = edge.element()
      // strokeWidth may be '2' or '2px' depending on browser
      expect(['2', '2px']).toContain(el.style.strokeWidth)
      expect(el.style.stroke).toBe('red')
    })
  })

  describe('labels', () => {
    it('renders label when data.key is provided with string value', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ key: 'label' }} />,
      )

      const labelRenderer = screen.getByTestId('edge-label-renderer')
      expect(labelRenderer.element()).toBeTruthy()
      await expect.element(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders label when data.key is provided with number value', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ key: 'count' }} />,
      )

      await expect.element(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders label as JSON when data.key points to object', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ key: 'config' }} />,
      )

      await expect
        .element(screen.getByText('{"key":"value"}'))
        .toBeInTheDocument()
    })

    it('does not render label when data.key is not provided', async () => {
      const screen = await render(<DataEdge {...defaultProps} data={{}} />)

      const labelRenderer = screen.container.querySelector(
        '[data-testid="edge-label-renderer"]',
      )
      expect(labelRenderer).toBeFalsy()
    })

    it('does not render label when data is undefined', async () => {
      const screen = await render(<DataEdge {...defaultProps} />)

      const labelRenderer = screen.container.querySelector(
        '[data-testid="edge-label-renderer"]',
      )
      expect(labelRenderer).toBeFalsy()
    })

    it('label container has correct styling', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ key: 'label' }} />,
      )

      const labelContainer = screen.container.querySelector(
        '[data-testid="edge-label-renderer"] > div',
      )
      expect(labelContainer).toBeTruthy()
      expect(labelContainer?.classList.contains('absolute')).toBe(true)
      expect(labelContainer?.classList.contains('rounded')).toBe(true)
    })
  })

  describe('path type combinations', () => {
    it('renders bezier path with label', async () => {
      const screen = await render(
        <DataEdge {...defaultProps} data={{ path: 'bezier', key: 'label' }} />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('d')).toBe(
        'M0 0 C50 0, 50 100, 100 100',
      )
      await expect.element(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('renders smoothstep path with label', async () => {
      const screen = await render(
        <DataEdge
          {...defaultProps}
          data={{ path: 'smoothstep', key: 'count' }}
        />,
      )

      const edge = screen.getByTestId('edge-edge-1')
      expect(edge.element().getAttribute('d')).toBe(
        'M0 0 L50 0 L50 100 L100 100',
      )
      await expect.element(screen.getByText('42')).toBeInTheDocument()
    })
  })
})
