/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it, vi } from 'vitest'
import type { FableBuilderV1 } from '@/api/types/fable.types'
import {
  decodeFableFromURL,
  encodeFableToURL,
  getFableCompressionStats,
  isStateTooLarge,
} from '@/features/fable-builder/utils/url-state'

// Mock the logger to suppress warnings during tests
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('url-state', () => {
  const simpleFable: FableBuilderV1 = {
    blocks: {
      'block-1': {
        factory_id: {
          plugin: { store: 'ecmwf', local: 'core' },
          factory: 'model',
        },
        configuration_values: { param1: 'value1' },
        input_ids: {},
      },
    },
  }

  const emptyFable: FableBuilderV1 = {
    blocks: {},
  }

  const complexFable: FableBuilderV1 = {
    blocks: {
      'block-1': {
        factory_id: {
          plugin: { store: 'ecmwf', local: 'core' },
          factory: 'model',
        },
        configuration_values: { param1: 'value1', param2: 'value2' },
        input_ids: {},
      },
      'block-2': {
        factory_id: {
          plugin: { store: 'ecmwf', local: 'core' },
          factory: 'transform',
        },
        configuration_values: { method: 'average' },
        input_ids: { input: 'block-1' },
      },
      'block-3': {
        factory_id: {
          plugin: { store: 'ecmwf', local: 'output' },
          factory: 'chart',
        },
        configuration_values: { title: 'My Chart', type: 'line' },
        input_ids: { data: 'block-2' },
      },
    },
  }

  describe('encodeFableToURL', () => {
    it('encodes an empty fable', () => {
      const encoded = encodeFableToURL(emptyFable)

      expect(encoded).toBeTypeOf('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('encodes a simple fable', () => {
      const encoded = encodeFableToURL(simpleFable)

      expect(encoded).toBeTypeOf('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('encodes a complex fable', () => {
      const encoded = encodeFableToURL(complexFable)

      expect(encoded).toBeTypeOf('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('produces URL-safe output', () => {
      const encoded = encodeFableToURL(simpleFable)

      // lz-string compressToEncodedURIComponent uses a-z, A-Z, 0-9, +, -, and _
      // This is URL-safe without needing additional encoding
      expect(encoded).toMatch(/^[A-Za-z0-9+\-_]+$/)
    })

    it('produces consistent output for same input', () => {
      const encoded1 = encodeFableToURL(simpleFable)
      const encoded2 = encodeFableToURL(simpleFable)

      expect(encoded1).toBe(encoded2)
    })

    it('produces different output for different inputs', () => {
      const encoded1 = encodeFableToURL(simpleFable)
      const encoded2 = encodeFableToURL(emptyFable)

      expect(encoded1).not.toBe(encoded2)
    })
  })

  describe('decodeFableFromURL', () => {
    it('decodes an encoded empty fable', () => {
      const encoded = encodeFableToURL(emptyFable)
      const decoded = decodeFableFromURL(encoded)

      expect(decoded).toEqual(emptyFable)
    })

    it('decodes an encoded simple fable', () => {
      const encoded = encodeFableToURL(simpleFable)
      const decoded = decodeFableFromURL(encoded)

      expect(decoded).toEqual(simpleFable)
    })

    it('decodes an encoded complex fable', () => {
      const encoded = encodeFableToURL(complexFable)
      const decoded = decodeFableFromURL(encoded)

      expect(decoded).toEqual(complexFable)
    })

    it('returns null for invalid encoded string', () => {
      const decoded = decodeFableFromURL('invalid-string')

      expect(decoded).toBeNull()
    })

    it('returns null for empty string', () => {
      const decoded = decodeFableFromURL('')

      expect(decoded).toBeNull()
    })

    it('returns null for corrupted encoded string', () => {
      const encoded = encodeFableToURL(simpleFable)
      // Corrupt the string by removing characters
      const corrupted = encoded.substring(0, encoded.length / 2)
      const decoded = decodeFableFromURL(corrupted)

      expect(decoded).toBeNull()
    })

    it('returns null for valid JSON but invalid fable schema', async () => {
      // Manually encode an object that doesn't match FableBuilderV1Schema
      const invalidFable = { notBlocks: {} }
      const lzString = await import('lz-string')
      const encoded = lzString.compressToEncodedURIComponent(
        JSON.stringify(invalidFable),
      )
      const decoded = decodeFableFromURL(encoded)

      expect(decoded).toBeNull()
    })
  })

  describe('getFableCompressionStats', () => {
    it('returns stats for empty fable', () => {
      const stats = getFableCompressionStats(emptyFable)

      expect(stats).toHaveProperty('originalSize')
      expect(stats).toHaveProperty('compressedSize')
      expect(stats).toHaveProperty('ratio')
      expect(stats.originalSize).toBeGreaterThan(0)
      expect(stats.compressedSize).toBeGreaterThan(0)
      expect(stats.ratio).toBeGreaterThan(0)
    })

    it('returns stats for simple fable', () => {
      const stats = getFableCompressionStats(simpleFable)

      expect(stats.originalSize).toBeGreaterThan(0)
      expect(stats.compressedSize).toBeGreaterThan(0)
      expect(stats.ratio).toBeGreaterThan(0)
    })

    it('returns stats for complex fable', () => {
      const stats = getFableCompressionStats(complexFable)

      expect(stats.originalSize).toBeGreaterThan(0)
      expect(stats.compressedSize).toBeGreaterThan(0)
    })

    it('originalSize matches JSON.stringify length', () => {
      const stats = getFableCompressionStats(simpleFable)
      const jsonLength = JSON.stringify(simpleFable).length

      expect(stats.originalSize).toBe(jsonLength)
    })

    it('compressedSize matches encoded length', () => {
      const stats = getFableCompressionStats(simpleFable)
      const encoded = encodeFableToURL(simpleFable)

      expect(stats.compressedSize).toBe(encoded.length)
    })

    it('ratio is compressedSize / originalSize', () => {
      const stats = getFableCompressionStats(simpleFable)

      expect(stats.ratio).toBeCloseTo(
        stats.compressedSize / stats.originalSize,
        5,
      )
    })
  })

  describe('isStateTooLarge', () => {
    it('returns false for empty fable', () => {
      const encoded = encodeFableToURL(emptyFable)

      expect(isStateTooLarge(encoded)).toBe(false)
    })

    it('returns false for simple fable', () => {
      const encoded = encodeFableToURL(simpleFable)

      expect(isStateTooLarge(encoded)).toBe(false)
    })

    it('returns false for complex fable under threshold', () => {
      const encoded = encodeFableToURL(complexFable)

      expect(isStateTooLarge(encoded)).toBe(false)
    })

    it('returns true for very large fable', () => {
      // Create a fable with many blocks to exceed the 1800 char limit
      const largeFable: FableBuilderV1 = {
        blocks: {},
      }

      for (let i = 0; i < 100; i++) {
        largeFable.blocks[`block-${i}`] = {
          factory_id: {
            plugin: { store: 'ecmwf', local: 'core' },
            factory: `factory-${i}`,
          },
          configuration_values: {
            param1: 'value-with-some-extra-text-to-increase-size',
            param2: 'another-value-with-more-text-for-testing',
            param3: 'third-parameter-value-for-size-testing',
          },
          input_ids: { input1: `block-${i - 1}`, input2: `block-${i - 2}` },
        }
      }

      const encoded = encodeFableToURL(largeFable)

      expect(isStateTooLarge(encoded)).toBe(true)
    })
  })

  describe('round-trip encoding/decoding', () => {
    it('preserves fable data through encode/decode cycle', () => {
      const fables = [emptyFable, simpleFable, complexFable]

      for (const fable of fables) {
        const encoded = encodeFableToURL(fable)
        const decoded = decodeFableFromURL(encoded)

        expect(decoded).toEqual(fable)
      }
    })

    it('preserves all block properties', () => {
      const encoded = encodeFableToURL(complexFable)
      const decoded = decodeFableFromURL(encoded)

      expect(decoded?.blocks['block-1'].factory_id).toEqual({
        plugin: { store: 'ecmwf', local: 'core' },
        factory: 'model',
      })
      expect(decoded?.blocks['block-1'].configuration_values).toEqual({
        param1: 'value1',
        param2: 'value2',
      })
      expect(decoded?.blocks['block-2'].input_ids).toEqual({
        input: 'block-1',
      })
    })

    it('handles special characters in configuration values', () => {
      const fableWithSpecialChars: FableBuilderV1 = {
        blocks: {
          'block-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'core' },
              factory: 'model',
            },
            configuration_values: {
              path: '/path/to/file with spaces.txt',
              query: 'name="test" & value=<123>',
              unicode: '\u00e9\u00e8\u00ea', // é è ê
            },
            input_ids: {},
          },
        },
      }

      const encoded = encodeFableToURL(fableWithSpecialChars)
      const decoded = decodeFableFromURL(encoded)

      expect(decoded).toEqual(fableWithSpecialChars)
    })
  })
})
