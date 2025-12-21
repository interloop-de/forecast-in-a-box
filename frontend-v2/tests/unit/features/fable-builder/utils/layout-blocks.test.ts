/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it } from 'vitest'
import type { Edge, Node } from '@xyflow/react'
import type { FableNodeData } from '@/features/fable-builder/utils/fable-to-graph'
import {
  layoutNodes,
  needsLayout,
} from '@/features/fable-builder/utils/layout-blocks'

// Sample nodes for testing
function createMockNodes(): Array<Node<FableNodeData>> {
  return [
    {
      id: 'node-1',
      type: 'sourceBlock',
      position: { x: 0, y: 0 },
      data: {
        instanceId: 'node-1',
        instance: {} as FableNodeData['instance'],
        factory: {} as FableNodeData['factory'],
        label: 'Source Node',
        catalogue: {} as FableNodeData['catalogue'],
      },
    },
    {
      id: 'node-2',
      type: 'transformBlock',
      position: { x: 0, y: 0 },
      data: {
        instanceId: 'node-2',
        instance: {} as FableNodeData['instance'],
        factory: {} as FableNodeData['factory'],
        label: 'Transform Node',
        catalogue: {} as FableNodeData['catalogue'],
      },
    },
    {
      id: 'node-3',
      type: 'productBlock',
      position: { x: 0, y: 0 },
      data: {
        instanceId: 'node-3',
        instance: {} as FableNodeData['instance'],
        factory: {} as FableNodeData['factory'],
        label: 'Product Node',
        catalogue: {} as FableNodeData['catalogue'],
      },
    },
  ]
}

// Sample edges for testing
function createMockEdges(): Array<Edge> {
  return [
    { id: 'edge-1-2', source: 'node-1', target: 'node-2' },
    { id: 'edge-2-3', source: 'node-2', target: 'node-3' },
  ]
}

describe('layout-blocks', () => {
  describe('layoutNodes', () => {
    it('positions nodes using dagre', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges)

      // All nodes should have been repositioned (not at 0,0)
      expect(layoutedNodes).toHaveLength(3)

      // Dagre should have computed positions for all nodes
      layoutedNodes.forEach((node) => {
        expect(typeof node.position.x).toBe('number')
        expect(typeof node.position.y).toBe('number')
      })
    })

    it('maintains node order', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges)

      expect(layoutedNodes[0].id).toBe('node-1')
      expect(layoutedNodes[1].id).toBe('node-2')
      expect(layoutedNodes[2].id).toBe('node-3')
    })

    it('uses default dimensions when not provided', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges)

      // Should not throw and should return positioned nodes
      expect(layoutedNodes).toHaveLength(3)
    })

    it('uses custom dimensions when provided', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()
      const nodeDimensions = {
        'node-1': { width: 300, height: 150 },
        'node-2': { width: 300, height: 150 },
        'node-3': { width: 300, height: 150 },
      }

      const layoutedNodes = layoutNodes(nodes, edges, {}, nodeDimensions)

      // Should not throw and should return positioned nodes
      expect(layoutedNodes).toHaveLength(3)
    })

    it('handles TB direction', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges, { direction: 'TB' })

      // In TB layout, connected nodes should be vertically stacked
      // node-1 should be above node-2 which should be above node-3
      expect(layoutedNodes[0].position.y).toBeLessThan(
        layoutedNodes[1].position.y,
      )
      expect(layoutedNodes[1].position.y).toBeLessThan(
        layoutedNodes[2].position.y,
      )
    })

    it('handles LR direction', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges, { direction: 'LR' })

      // In LR layout, connected nodes should be horizontally arranged
      // node-1 should be left of node-2 which should be left of node-3
      expect(layoutedNodes[0].position.x).toBeLessThan(
        layoutedNodes[1].position.x,
      )
      expect(layoutedNodes[1].position.x).toBeLessThan(
        layoutedNodes[2].position.x,
      )
    })

    it('respects node spacing options', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const tightLayout = layoutNodes(nodes, edges, {
        direction: 'TB',
        nodeSpacingY: 50,
      })

      const looseLayout = layoutNodes(nodes, edges, {
        direction: 'TB',
        nodeSpacingY: 200,
      })

      // Loose layout should have greater vertical spacing
      const tightGap = tightLayout[1].position.y - tightLayout[0].position.y
      const looseGap = looseLayout[1].position.y - looseLayout[0].position.y

      expect(looseGap).toBeGreaterThan(tightGap)
    })

    it('preserves other node properties', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const layoutedNodes = layoutNodes(nodes, edges)

      // Node properties should be preserved
      expect(layoutedNodes[0].type).toBe('sourceBlock')
      expect(layoutedNodes[0].data.instanceId).toBe('node-1')
      expect(layoutedNodes[0].data.label).toBe('Source Node')
    })

    it('handles nodes without edges', () => {
      const nodes = createMockNodes()
      const edges: Array<Edge> = []

      const layoutedNodes = layoutNodes(nodes, edges)

      // Should still layout nodes even without edges
      expect(layoutedNodes).toHaveLength(3)
    })
  })

  describe('needsLayout', () => {
    it('returns true when all nodes at (0,0)', () => {
      const nodes = createMockNodes() // All at (0,0)

      expect(needsLayout(nodes)).toBe(true)
    })

    it('returns true when some nodes at (0,0)', () => {
      const nodes = createMockNodes()
      nodes[0].position = { x: 100, y: 100 } // One positioned

      expect(needsLayout(nodes)).toBe(true)
    })

    it('returns false when all nodes have positions', () => {
      const nodes = createMockNodes()
      nodes[0].position = { x: 100, y: 100 }
      nodes[1].position = { x: 200, y: 200 }
      nodes[2].position = { x: 300, y: 300 }

      expect(needsLayout(nodes)).toBe(false)
    })

    it('returns false for empty array', () => {
      const nodes: Array<Node<FableNodeData>> = []

      // some() returns false for empty array
      expect(needsLayout(nodes)).toBe(false)
    })

    it('returns false when node has x=0 but y is non-zero', () => {
      const nodes = createMockNodes()
      nodes[0].position = { x: 0, y: 100 }
      nodes[1].position = { x: 200, y: 200 }
      nodes[2].position = { x: 300, y: 300 }

      expect(needsLayout(nodes)).toBe(false)
    })

    it('returns false when node has y=0 but x is non-zero', () => {
      const nodes = createMockNodes()
      nodes[0].position = { x: 100, y: 0 }
      nodes[1].position = { x: 200, y: 200 }
      nodes[2].position = { x: 300, y: 300 }

      expect(needsLayout(nodes)).toBe(false)
    })
  })
})
