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
import type {
  BlockFactory,
  BlockFactoryCatalogue,
  FableBuilderV1,
} from '@/api/types/fable.types'
import {
  fableToEdges,
  fableToGraph,
  fableToNodes,
} from '@/features/fable-builder/utils/fable-to-graph'

// Sample catalogue with factories (nested structure: catalogue[pluginId].factories[factoryId])
const mockCatalogue: BlockFactoryCatalogue = {
  'test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'AIFS Source',
        description: 'AIFS data source',
        inputs: [],
        configuration_options: {},
      } as BlockFactory,
      'product-factory': {
        kind: 'product',
        title: 'Temperature Product',
        description: 'Temperature output',
        inputs: ['data'],
        configuration_options: {},
      } as BlockFactory,
      'transform-factory': {
        kind: 'transform',
        title: 'Data Transform',
        description: 'Data transformation',
        inputs: ['input'],
        configuration_options: {},
      } as BlockFactory,
      'sink-factory': {
        kind: 'sink',
        title: 'File Sink',
        description: 'File output',
        inputs: ['data'],
        configuration_options: {},
      } as BlockFactory,
    },
  },
}

// Sample fable with blocks using PluginBlockFactoryId structure
const mockFable: FableBuilderV1 = {
  blocks: {
    'block-source': {
      factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
      configuration_values: {},
      input_ids: {},
    },
    'block-transform': {
      factory_id: { plugin: 'test-plugin', factory: 'transform-factory' },
      configuration_values: {},
      input_ids: {
        input: 'block-source',
      },
    },
    'block-product': {
      factory_id: { plugin: 'test-plugin', factory: 'product-factory' },
      configuration_values: {},
      input_ids: {
        data: 'block-transform',
      },
    },
  },
}

describe('fable-to-graph', () => {
  describe('fableToNodes', () => {
    it('converts fable blocks to nodes', () => {
      const nodes = fableToNodes(mockFable, mockCatalogue)

      expect(nodes).toHaveLength(3)
      expect(nodes.map((n) => n.id)).toContain('block-source')
      expect(nodes.map((n) => n.id)).toContain('block-transform')
      expect(nodes.map((n) => n.id)).toContain('block-product')
    })

    it('sets correct node type based on factory kind', () => {
      const nodes = fableToNodes(mockFable, mockCatalogue)

      const sourceNode = nodes.find((n) => n.id === 'block-source')
      const transformNode = nodes.find((n) => n.id === 'block-transform')
      const productNode = nodes.find((n) => n.id === 'block-product')

      expect(sourceNode?.type).toBe('sourceBlock')
      expect(transformNode?.type).toBe('transformBlock')
      expect(productNode?.type).toBe('productBlock')
    })

    it('skips blocks with missing factory', () => {
      const fableWithMissingFactory: FableBuilderV1 = {
        blocks: {
          'block-missing': {
            factory_id: { plugin: 'nonexistent', factory: 'nonexistent' },
            configuration_values: {},
            input_ids: {},
          },
          'block-source': {
            factory_id: { plugin: 'test-plugin', factory: 'source-factory' },
            configuration_values: {},
            input_ids: {},
          },
        },
      }

      const nodes = fableToNodes(fableWithMissingFactory, mockCatalogue)

      expect(nodes).toHaveLength(1)
      expect(nodes[0].id).toBe('block-source')
    })

    it('includes factory and instance data in node', () => {
      const nodes = fableToNodes(mockFable, mockCatalogue)

      const sourceNode = nodes.find((n) => n.id === 'block-source')
      expect(sourceNode?.data.instanceId).toBe('block-source')
      expect(sourceNode?.data.instance).toEqual(
        mockFable.blocks['block-source'],
      )
      expect(sourceNode?.data.factory).toEqual(
        mockCatalogue['test-plugin'].factories['source-factory'],
      )
      expect(sourceNode?.data.label).toBe('AIFS Source')
      expect(sourceNode?.data.catalogue).toBe(mockCatalogue)
    })

    it('initializes node positions to (0, 0)', () => {
      const nodes = fableToNodes(mockFable, mockCatalogue)

      nodes.forEach((node) => {
        expect(node.position).toEqual({ x: 0, y: 0 })
      })
    })
  })

  describe('fableToEdges', () => {
    it('creates edges from input_ids', () => {
      const edges = fableToEdges(mockFable, mockCatalogue)

      expect(edges).toHaveLength(2)
    })

    it('sets correct source and target', () => {
      const edges = fableToEdges(mockFable, mockCatalogue)

      const transformEdge = edges.find((e) => e.target === 'block-transform')
      expect(transformEdge?.source).toBe('block-source')

      const productEdge = edges.find((e) => e.target === 'block-product')
      expect(productEdge?.source).toBe('block-transform')
    })

    it('sets correct source/target handles', () => {
      const edges = fableToEdges(mockFable, mockCatalogue)

      edges.forEach((edge) => {
        expect(edge.sourceHandle).toBe('output')
        expect(typeof edge.targetHandle).toBe('string')
      })
    })

    it('skips null source ids', () => {
      const fableWithNullInput: FableBuilderV1 = {
        blocks: {
          'block-product': {
            factory_id: { plugin: 'test-plugin', factory: 'product-factory' },
            configuration_values: {},
            input_ids: {
              data: null as unknown as string,
            },
          },
        },
      }

      const edges = fableToEdges(fableWithNullInput, mockCatalogue)

      expect(edges).toHaveLength(0)
    })

    it('sets edge type to fableEdge', () => {
      const edges = fableToEdges(mockFable, mockCatalogue)

      edges.forEach((edge) => {
        expect(edge.type).toBe('fableEdge')
      })
    })

    it('includes input name in edge data', () => {
      const edges = fableToEdges(mockFable, mockCatalogue)

      const transformEdge = edges.find((e) => e.target === 'block-transform')
      expect(transformEdge?.data?.inputName).toBe('input')

      const productEdge = edges.find((e) => e.target === 'block-product')
      expect(productEdge?.data?.inputName).toBe('data')
    })
  })

  describe('fableToGraph', () => {
    it('returns both nodes and edges', () => {
      const { nodes, edges } = fableToGraph(mockFable, mockCatalogue)

      expect(nodes).toHaveLength(3)
      expect(edges).toHaveLength(2)
    })
  })

  describe('node type mapping', () => {
    it('maps sink kind to sinkBlock type', () => {
      const fableWithSink: FableBuilderV1 = {
        blocks: {
          'block-sink': {
            factory_id: { plugin: 'test-plugin', factory: 'sink-factory' },
            configuration_values: {},
            input_ids: {},
          },
        },
      }

      const nodes = fableToNodes(fableWithSink, mockCatalogue)
      expect(nodes[0].type).toBe('sinkBlock')
    })

    it('uses default type for unknown kinds', () => {
      const catalogueWithUnknown: BlockFactoryCatalogue = {
        'test-plugin': {
          factories: {
            'unknown-factory': {
              kind: 'unknown' as 'source', // Cast to avoid type error
              title: 'Unknown',
              description: 'Unknown type',
              inputs: [],
              configuration_options: {},
            } as BlockFactory,
          },
        },
      }

      const fableWithUnknown: FableBuilderV1 = {
        blocks: {
          'block-unknown': {
            factory_id: { plugin: 'test-plugin', factory: 'unknown-factory' },
            configuration_values: {},
            input_ids: {},
          },
        },
      }

      const nodes = fableToNodes(fableWithUnknown, catalogueWithUnknown)
      expect(nodes[0].type).toBe('default')
    })
  })
})
