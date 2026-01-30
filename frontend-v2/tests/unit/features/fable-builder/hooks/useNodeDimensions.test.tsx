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
import { useNodeDimensions } from '@/features/fable-builder/hooks/useNodeDimensions'

// Mock ResizeObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
let resizeCallback: ResizeObserverCallback | null = null

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }
  observe = mockObserve
  disconnect = mockDisconnect
  unobserve = vi.fn()
}

// Store original ResizeObserver
const OriginalResizeObserver = globalThis.ResizeObserver

// Mock useReactFlow
const mockUpdateNode = vi.fn()
vi.mock('@xyflow/react', () => ({
  useReactFlow: () => ({
    updateNode: mockUpdateNode,
  }),
}))

describe('useNodeDimensions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resizeCallback = null
    globalThis.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = OriginalResizeObserver
  })

  function TestComponent({ nodeId }: { nodeId: string }) {
    const containerRef = useNodeDimensions(nodeId)
    return (
      <div
        ref={containerRef}
        data-testid="container"
        style={{ width: 200, height: 100 }}
      >
        Content
      </div>
    )
  }

  it('returns a ref that can be attached to an element', async () => {
    const screen = await render(<TestComponent nodeId="node-1" />)

    const container = screen.getByTestId('container')
    await expect.element(container).toBeInTheDocument()
  })

  it('creates ResizeObserver on mount', async () => {
    await render(<TestComponent nodeId="node-1" />)

    expect(mockObserve).toHaveBeenCalledTimes(1)
  })

  it('observes the container element', async () => {
    const screen = await render(<TestComponent nodeId="node-1" />)

    const container = screen.getByTestId('container').element()
    expect(mockObserve).toHaveBeenCalledWith(container)
  })

  it('disconnects observer on unmount', async () => {
    const screen = await render(<TestComponent nodeId="node-1" />)

    screen.unmount()

    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })

  it('calls updateNode when ResizeObserver reports dimensions', async () => {
    await render(<TestComponent nodeId="test-node" />)

    // Simulate resize event
    if (resizeCallback) {
      const mockEntry: ResizeObserverEntry = {
        contentRect: {
          width: 300,
          height: 150,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 300,
          bottom: 150,
          toJSON: () => ({}),
        },
        target: document.createElement('div'),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      }
      resizeCallback([mockEntry], {} as ResizeObserver)
    }

    expect(mockUpdateNode).toHaveBeenCalledWith('test-node', {
      measured: { width: 300, height: 150 },
    })
  })

  it('uses correct nodeId in updateNode call', async () => {
    await render(<TestComponent nodeId="custom-node-id" />)

    if (resizeCallback) {
      const mockEntry: ResizeObserverEntry = {
        contentRect: {
          width: 100,
          height: 50,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 100,
          bottom: 50,
          toJSON: () => ({}),
        },
        target: document.createElement('div'),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      }
      resizeCallback([mockEntry], {} as ResizeObserver)
    }

    expect(mockUpdateNode).toHaveBeenCalledWith('custom-node-id', {
      measured: { width: 100, height: 50 },
    })
  })

  it('handles multiple resize events', async () => {
    await render(<TestComponent nodeId="node-1" />)

    if (resizeCallback) {
      // First resize
      resizeCallback(
        [
          {
            contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
            target: document.createElement('div'),
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        {} as ResizeObserver,
      )

      // Second resize
      resizeCallback(
        [
          {
            contentRect: { width: 200, height: 100 } as DOMRectReadOnly,
            target: document.createElement('div'),
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        {} as ResizeObserver,
      )
    }

    expect(mockUpdateNode).toHaveBeenCalledTimes(2)
    expect(mockUpdateNode).toHaveBeenLastCalledWith('node-1', {
      measured: { width: 200, height: 100 },
    })
  })

  it('re-creates observer when nodeId changes', async () => {
    const screen = await render(<TestComponent nodeId="node-1" />)

    // Initial observation
    expect(mockObserve).toHaveBeenCalledTimes(1)

    // Re-render with new nodeId
    screen.rerender(<TestComponent nodeId="node-2" />)

    // Should disconnect old and create new (async effect cleanup)
    await vi.waitFor(() => {
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })
})
