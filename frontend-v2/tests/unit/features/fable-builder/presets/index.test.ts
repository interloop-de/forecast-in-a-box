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
import type { PresetId } from '@/features/fable-builder/presets'
import {
  FABLE_PRESETS,
  getPreset,
  getPresetIds,
} from '@/features/fable-builder/presets'

describe('FABLE_PRESETS', () => {
  it('contains quick-start preset', () => {
    expect(FABLE_PRESETS['quick-start']).toBeDefined()
    expect(FABLE_PRESETS['quick-start'].id).toBe('quick-start')
    expect(FABLE_PRESETS['quick-start'].name).toBe('Quick Start')
    expect(FABLE_PRESETS['quick-start'].description).toBe(
      'Ready to run with optimized defaults',
    )
  })

  it('contains standard preset', () => {
    expect(FABLE_PRESETS.standard).toBeDefined()
    expect(FABLE_PRESETS.standard.id).toBe('standard')
    expect(FABLE_PRESETS.standard.name).toBe('Standard Forecast')
    expect(FABLE_PRESETS.standard.description).toBe(
      'Standard model forecast setup',
    )
  })

  it('contains custom-model preset', () => {
    expect(FABLE_PRESETS['custom-model']).toBeDefined()
    expect(FABLE_PRESETS['custom-model'].id).toBe('custom-model')
    expect(FABLE_PRESETS['custom-model'].name).toBe('Custom Model Forecast')
    expect(FABLE_PRESETS['custom-model'].description).toBe(
      'Start with empty canvas for full customization',
    )
    // Custom model should have empty blocks
    expect(
      Object.keys(FABLE_PRESETS['custom-model'].fable.blocks),
    ).toHaveLength(0)
  })

  it('contains dataset preset', () => {
    expect(FABLE_PRESETS.dataset).toBeDefined()
    expect(FABLE_PRESETS.dataset.id).toBe('dataset')
    expect(FABLE_PRESETS.dataset.name).toBe('Dataset Forecast')
    expect(FABLE_PRESETS.dataset.description).toBe(
      'Start with pre-existing forecast data from ECMWF AIFS',
    )
  })

  it('quick-start preset has multiple blocks', () => {
    const blocks = FABLE_PRESETS['quick-start'].fable.blocks
    expect(Object.keys(blocks).length).toBeGreaterThan(1)
    expect(blocks.source_1).toBeDefined()
    expect(blocks.filter_1).toBeDefined()
    expect(blocks.viz_1).toBeDefined()
  })

  it('standard preset has source block', () => {
    const blocks = FABLE_PRESETS.standard.fable.blocks
    expect(blocks.source_1).toBeDefined()
    expect(blocks.source_1.factory_id.plugin).toEqual({
      store: 'ecmwf',
      local: 'anemoi-inference',
    })
    expect(blocks.source_1.factory_id.factory).toBe('model_forecast')
  })

  it('dataset preset uses mars_aifs_external factory', () => {
    const blocks = FABLE_PRESETS.dataset.fable.blocks
    expect(blocks.source_1.factory_id.plugin).toEqual({
      store: 'ecmwf',
      local: 'mars-connector',
    })
    expect(blocks.source_1.factory_id.factory).toBe('mars_aifs_external')
  })

  it('all presets have valid fable structure', () => {
    for (const preset of Object.values(FABLE_PRESETS)) {
      expect(preset.fable).toBeDefined()
      expect(preset.fable.blocks).toBeDefined()
      expect(typeof preset.fable.blocks).toBe('object')

      // Each block should have required properties
      for (const block of Object.values(preset.fable.blocks)) {
        expect(block.factory_id).toBeDefined()
        expect(block.factory_id.plugin).toBeDefined()
        expect(block.factory_id.factory).toBeDefined()
        expect(block.configuration_values).toBeDefined()
        expect(block.input_ids).toBeDefined()
      }
    }
  })
})

describe('getPreset', () => {
  it('returns preset for valid id', () => {
    const preset = getPreset('quick-start')
    expect(preset).toBeDefined()
    expect(preset?.id).toBe('quick-start')
    expect(preset?.name).toBe('Quick Start')
  })

  it('returns preset for all valid ids', () => {
    const ids: Array<PresetId> = [
      'quick-start',
      'standard',
      'custom-model',
      'dataset',
    ]
    for (const id of ids) {
      const preset = getPreset(id)
      expect(preset).toBeDefined()
      expect(preset?.id).toBe(id)
    }
  })
})

describe('getPresetIds', () => {
  it('returns all preset ids', () => {
    const ids = getPresetIds()
    expect(ids).toContain('quick-start')
    expect(ids).toContain('standard')
    expect(ids).toContain('custom-model')
    expect(ids).toContain('dataset')
  })

  it('returns correct number of presets', () => {
    const ids = getPresetIds()
    expect(ids).toHaveLength(4)
  })

  it('returns array of PresetId type', () => {
    const ids = getPresetIds()
    expect(Array.isArray(ids)).toBe(true)
    for (const id of ids) {
      expect(typeof id).toBe('string')
    }
  })
})
