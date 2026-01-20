/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import type { FableBuilderV1 } from '@/api/types/fable.types'
import type { PluginCompositeId } from '@/api/types/plugins.types'

export type PresetId = 'quick-start' | 'standard' | 'custom-model' | 'dataset'

export interface FablePreset {
  id: PresetId
  name: string
  description: string
  fable: FableBuilderV1
}

/**
 * Helper to create PluginCompositeId
 */
function pluginId(store: string, local: string): PluginCompositeId {
  return { store, local }
}

const quickStartPreset: FablePreset = {
  id: 'quick-start',
  name: 'Quick Start',
  description: 'Ready to run with optimized defaults',
  fable: {
    blocks: {
      source_1: {
        factory_id: {
          plugin: pluginId('ecmwf', 'anemoi-inference'),
          factory: 'model_forecast',
        },
        configuration_values: {
          model: 'aifs/single-mse-v0.2.1',
          date: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
          lead_time: '72',
          ensemble_members: '1',
        },
        input_ids: {},
      },
      filter_1: {
        factory_id: {
          plugin: pluginId('ecmwf', 'fiab-products'),
          factory: 'variable_filter',
        },
        configuration_values: {
          variables: 'temp_2m,wind_u,wind_v,precip,mslp',
          interpolation_method: 'linear',
        },
        input_ids: {
          forecast: 'source_1',
        },
      },
      viz_1: {
        factory_id: {
          plugin: pluginId('ecmwf', 'fiab-sinks'),
          factory: 'plot',
        },
        configuration_values: {
          ekp_subcommand: 'contour --variable temp_2m',
        },
        input_ids: {
          data: 'filter_1',
        },
      },
    },
  },
}

const standardPreset: FablePreset = {
  id: 'standard',
  name: 'Standard Forecast',
  description: 'Standard model forecast setup',
  fable: {
    blocks: {
      source_1: {
        factory_id: {
          plugin: pluginId('ecmwf', 'anemoi-inference'),
          factory: 'model_forecast',
        },
        configuration_values: {
          model: 'aifs/single-mse-v0.2.1',
          date: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
          lead_time: '48',
          ensemble_members: '1',
        },
        input_ids: {},
      },
    },
  },
}

const customModelPreset: FablePreset = {
  id: 'custom-model',
  name: 'Custom Model Forecast',
  description: 'Start with empty canvas for full customization',
  fable: {
    blocks: {},
  },
}

const datasetPreset: FablePreset = {
  id: 'dataset',
  name: 'Dataset Forecast',
  description: 'Start with pre-existing forecast data from ECMWF AIFS',
  fable: {
    blocks: {
      source_1: {
        factory_id: {
          plugin: pluginId('ecmwf', 'mars-connector'),
          factory: 'mars_aifs_external',
        },
        configuration_values: {
          date: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
          time: '00:00:00',
          step: '0/6/12/18/24',
          levtype: 'sfc',
          param: '2t/10u/10v/msl/tp',
        },
        input_ids: {},
      },
    },
  },
}

export const FABLE_PRESETS: Record<PresetId, FablePreset> = {
  'quick-start': quickStartPreset,
  standard: standardPreset,
  'custom-model': customModelPreset,
  dataset: datasetPreset,
}

export function getPreset(id: PresetId): FablePreset | undefined {
  return FABLE_PRESETS[id]
}

export function getPresetIds(): Array<PresetId> {
  return Object.keys(FABLE_PRESETS) as Array<PresetId>
}
