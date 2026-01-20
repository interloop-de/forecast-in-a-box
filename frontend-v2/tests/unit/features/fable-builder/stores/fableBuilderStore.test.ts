/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { BlockFactory, FableBuilderV1 } from '@/api/types/fable.types'
import {
  useBlockCount,
  useFableBuilderStore,
  useHasBlocks,
  useIsValid,
} from '@/features/fable-builder/stores/fableBuilderStore'
import { createEmptyFable } from '@/api/types/fable.types'

const mockFactory: BlockFactory = {
  kind: 'source',
  title: 'Test Source',
  description: 'A test source block',
  configuration_options: {
    param1: {
      title: 'Parameter 1',
      description: 'A string parameter',
      value_type: 'string',
    },
  },
  inputs: [],
}

const mockFable: FableBuilderV1 = {
  blocks: {
    'block-1': {
      factory_id: {
        plugin: { store: 'ecmwf', local: 'test' },
        factory: 'source',
      },
      configuration_values: { param1: 'value1' },
      input_ids: {},
    },
    'block-2': {
      factory_id: {
        plugin: { store: 'ecmwf', local: 'test' },
        factory: 'transform',
      },
      configuration_values: {},
      input_ids: { input: 'block-1' },
    },
  },
}

describe('useFableBuilderStore', () => {
  beforeEach(() => {
    act(() => useFableBuilderStore.getState().reset())
  })

  describe('initial state', () => {
    it('has empty fable initially', () => {
      const state = useFableBuilderStore.getState()
      expect(state.fable).toEqual(createEmptyFable())
    })

    it('has null fableId initially', () => {
      expect(useFableBuilderStore.getState().fableId).toBeNull()
    })

    it('has default fableName', () => {
      expect(useFableBuilderStore.getState().fableName).toBe(
        'Untitled Configuration',
      )
    })

    it('has graph mode by default', () => {
      expect(useFableBuilderStore.getState().mode).toBe('graph')
    })

    it('has edit step by default', () => {
      expect(useFableBuilderStore.getState().step).toBe('edit')
    })

    it('has no selected block initially', () => {
      expect(useFableBuilderStore.getState().selectedBlockId).toBeNull()
    })

    it('is not dirty initially', () => {
      expect(useFableBuilderStore.getState().isDirty).toBe(false)
    })
  })

  describe('setFable', () => {
    it('sets fable data', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      expect(useFableBuilderStore.getState().fable).toEqual(mockFable)
    })

    it('sets fableId when provided', () => {
      act(() =>
        useFableBuilderStore.getState().setFable(mockFable, 'fable-123'),
      )
      expect(useFableBuilderStore.getState().fableId).toBe('fable-123')
    })

    it('clears selection when setting fable', () => {
      act(() => useFableBuilderStore.getState().selectBlock('block-1'))
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      expect(useFableBuilderStore.getState().selectedBlockId).toBeNull()
    })

    it('clears validation state when setting fable', () => {
      act(() =>
        useFableBuilderStore.getState().setValidationState({
          isValid: true,
          globalErrors: [],
          blockStates: {},
          possibleSources: [],
        }),
      )
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      expect(useFableBuilderStore.getState().validationState).toBeNull()
    })

    it('resets isDirty to false', () => {
      act(() => useFableBuilderStore.getState().markDirty())
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      expect(useFableBuilderStore.getState().isDirty).toBe(false)
    })
  })

  describe('setFableName', () => {
    it('sets fable name', () => {
      act(() => useFableBuilderStore.getState().setFableName('My Forecast'))
      expect(useFableBuilderStore.getState().fableName).toBe('My Forecast')
    })

    it('marks as dirty', () => {
      act(() => useFableBuilderStore.getState().setFableName('My Forecast'))
      expect(useFableBuilderStore.getState().isDirty).toBe(true)
    })
  })

  describe('newFable', () => {
    it('resets fable to empty', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      act(() => useFableBuilderStore.getState().newFable())
      expect(useFableBuilderStore.getState().fable).toEqual(createEmptyFable())
    })

    it('preserves mode setting', () => {
      act(() => useFableBuilderStore.getState().setMode('form'))
      act(() => useFableBuilderStore.getState().newFable())
      expect(useFableBuilderStore.getState().mode).toBe('form')
    })
  })

  describe('addBlock', () => {
    it('adds block to fable', () => {
      act(() =>
        useFableBuilderStore
          .getState()
          .addBlock(
            { plugin: { store: 'ecmwf', local: 'test' }, factory: 'source' },
            mockFactory,
          ),
      )
      const blocks = useFableBuilderStore.getState().fable.blocks
      expect(Object.keys(blocks).length).toBe(1)
    })

    it('returns new block instance id', () => {
      let blockId = ''
      act(() => {
        blockId = useFableBuilderStore
          .getState()
          .addBlock(
            { plugin: { store: 'ecmwf', local: 'test' }, factory: 'source' },
            mockFactory,
          )
      })
      expect(blockId).toBeTruthy()
      expect(
        useFableBuilderStore.getState().fable.blocks[blockId],
      ).toBeDefined()
    })

    it('selects new block', () => {
      let blockId = ''
      act(() => {
        blockId = useFableBuilderStore
          .getState()
          .addBlock(
            { plugin: { store: 'ecmwf', local: 'test' }, factory: 'source' },
            mockFactory,
          )
      })
      expect(useFableBuilderStore.getState().selectedBlockId).toBe(blockId)
    })

    it('marks as dirty', () => {
      act(() =>
        useFableBuilderStore
          .getState()
          .addBlock(
            { plugin: { store: 'ecmwf', local: 'test' }, factory: 'source' },
            mockFactory,
          ),
      )
      expect(useFableBuilderStore.getState().isDirty).toBe(true)
    })
  })

  describe('removeBlock', () => {
    beforeEach(() => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
    })

    it('removes block from fable', () => {
      act(() => useFableBuilderStore.getState().removeBlock('block-1'))
      expect(
        useFableBuilderStore.getState().fable.blocks['block-1'],
      ).toBeUndefined()
    })

    it('removes references to deleted block from other blocks', () => {
      act(() => useFableBuilderStore.getState().removeBlock('block-1'))
      expect(
        useFableBuilderStore.getState().fable.blocks['block-2'].input_ids,
      ).toEqual({})
    })

    it('clears selection if deleted block was selected', () => {
      act(() => useFableBuilderStore.getState().selectBlock('block-1'))
      act(() => useFableBuilderStore.getState().removeBlock('block-1'))
      expect(useFableBuilderStore.getState().selectedBlockId).toBeNull()
    })

    it('marks as dirty', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable)) // Reset dirty
      act(() => useFableBuilderStore.getState().removeBlock('block-1'))
      expect(useFableBuilderStore.getState().isDirty).toBe(true)
    })
  })

  describe('updateBlockConfig', () => {
    beforeEach(() => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
    })

    it('updates block configuration value', () => {
      act(() =>
        useFableBuilderStore
          .getState()
          .updateBlockConfig('block-1', 'param1', 'new_value'),
      )
      expect(
        useFableBuilderStore.getState().fable.blocks['block-1']
          .configuration_values.param1,
      ).toBe('new_value')
    })

    it('marks as dirty', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable)) // Reset dirty
      act(() =>
        useFableBuilderStore
          .getState()
          .updateBlockConfig('block-1', 'param1', 'new_value'),
      )
      expect(useFableBuilderStore.getState().isDirty).toBe(true)
    })
  })

  describe('connectBlocks', () => {
    beforeEach(() => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
    })

    it('connects blocks', () => {
      act(() =>
        useFableBuilderStore
          .getState()
          .connectBlocks('block-2', 'new_input', 'block-1'),
      )
      expect(
        useFableBuilderStore.getState().fable.blocks['block-2'].input_ids
          .new_input,
      ).toBe('block-1')
    })
  })

  describe('disconnectBlock', () => {
    beforeEach(() => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
    })

    it('disconnects input', () => {
      act(() =>
        useFableBuilderStore.getState().disconnectBlock('block-2', 'input'),
      )
      expect(
        useFableBuilderStore.getState().fable.blocks['block-2'].input_ids.input,
      ).toBeUndefined()
    })
  })

  describe('selectBlock', () => {
    it('selects block', () => {
      act(() => useFableBuilderStore.getState().selectBlock('block-1'))
      expect(useFableBuilderStore.getState().selectedBlockId).toBe('block-1')
    })

    it('opens config panel when selecting', () => {
      act(() => useFableBuilderStore.getState().setConfigPanelOpen(false))
      act(() => useFableBuilderStore.getState().selectBlock('block-1'))
      expect(useFableBuilderStore.getState().isConfigPanelOpen).toBe(true)
    })

    it('closes config panel when deselecting', () => {
      act(() => useFableBuilderStore.getState().selectBlock('block-1'))
      act(() => useFableBuilderStore.getState().selectBlock(null))
      expect(useFableBuilderStore.getState().isConfigPanelOpen).toBe(false)
    })
  })

  describe('mode controls', () => {
    it('sets mode', () => {
      act(() => useFableBuilderStore.getState().setMode('form'))
      expect(useFableBuilderStore.getState().mode).toBe('form')
    })

    it('sets step', () => {
      act(() => useFableBuilderStore.getState().setStep('review'))
      expect(useFableBuilderStore.getState().step).toBe('review')
    })

    it('toggles palette', () => {
      const initial = useFableBuilderStore.getState().isPaletteOpen
      act(() => useFableBuilderStore.getState().togglePalette())
      expect(useFableBuilderStore.getState().isPaletteOpen).toBe(!initial)
    })

    it('toggles config panel', () => {
      const initial = useFableBuilderStore.getState().isConfigPanelOpen
      act(() => useFableBuilderStore.getState().toggleConfigPanel())
      expect(useFableBuilderStore.getState().isConfigPanelOpen).toBe(!initial)
    })
  })

  describe('validation', () => {
    it('sets validation state', () => {
      const validationState = {
        isValid: false,
        globalErrors: ['Missing required block'],
        blockStates: {},
        possibleSources: [],
      }
      act(() =>
        useFableBuilderStore.getState().setValidationState(validationState),
      )
      expect(useFableBuilderStore.getState().validationState).toEqual(
        validationState,
      )
    })

    it('sets lastValidatedAt when setting validation state', () => {
      const before = Date.now()
      act(() =>
        useFableBuilderStore.getState().setValidationState({
          isValid: true,
          globalErrors: [],
          blockStates: {},
          possibleSources: [],
        }),
      )
      const after = Date.now()
      const lastValidatedAt = useFableBuilderStore.getState().lastValidatedAt
      expect(lastValidatedAt).toBeGreaterThanOrEqual(before)
      expect(lastValidatedAt).toBeLessThanOrEqual(after)
    })

    it('sets isValidating', () => {
      act(() => useFableBuilderStore.getState().setIsValidating(true))
      expect(useFableBuilderStore.getState().isValidating).toBe(true)
    })
  })

  describe('save state', () => {
    it('markSaved sets fableId and isDirty', () => {
      act(() => useFableBuilderStore.getState().markDirty())
      act(() => useFableBuilderStore.getState().markSaved('saved-id-123'))
      expect(useFableBuilderStore.getState().fableId).toBe('saved-id-123')
      expect(useFableBuilderStore.getState().isDirty).toBe(false)
    })

    it('markDirty sets isDirty', () => {
      act(() => useFableBuilderStore.getState().markDirty())
      expect(useFableBuilderStore.getState().isDirty).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets to initial state', () => {
      act(() =>
        useFableBuilderStore.getState().setFable(mockFable, 'fable-123'),
      )
      act(() => useFableBuilderStore.getState().setMode('form'))
      act(() => useFableBuilderStore.getState().reset())

      const state = useFableBuilderStore.getState()
      expect(state.fable).toEqual(createEmptyFable())
      expect(state.fableId).toBeNull()
      expect(state.mode).toBe('graph')
      expect(state.isDirty).toBe(false)
    })
  })
})

describe('selector hooks', () => {
  beforeEach(() => {
    act(() => useFableBuilderStore.getState().reset())
  })

  describe('useBlockCount', () => {
    it('returns 0 for empty fable', () => {
      const { result } = renderHook(() => useBlockCount())
      expect(result.current).toBe(0)
    })

    it('returns correct count', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      const { result } = renderHook(() => useBlockCount())
      expect(result.current).toBe(2)
    })
  })

  describe('useHasBlocks', () => {
    it('returns false for empty fable', () => {
      const { result } = renderHook(() => useHasBlocks())
      expect(result.current).toBe(false)
    })

    it('returns true when blocks exist', () => {
      act(() => useFableBuilderStore.getState().setFable(mockFable))
      const { result } = renderHook(() => useHasBlocks())
      expect(result.current).toBe(true)
    })
  })

  describe('useIsValid', () => {
    it('returns false when no validation state', () => {
      const { result } = renderHook(() => useIsValid())
      expect(result.current).toBe(false)
    })

    it('returns true when valid', () => {
      act(() =>
        useFableBuilderStore.getState().setValidationState({
          isValid: true,
          globalErrors: [],
          blockStates: {},
          possibleSources: [],
        }),
      )
      const { result } = renderHook(() => useIsValid())
      expect(result.current).toBe(true)
    })

    it('returns false when invalid', () => {
      act(() =>
        useFableBuilderStore.getState().setValidationState({
          isValid: false,
          globalErrors: ['Error'],
          blockStates: {},
          possibleSources: [],
        }),
      )
      const { result } = renderHook(() => useIsValid())
      expect(result.current).toBe(false)
    })
  })
})
