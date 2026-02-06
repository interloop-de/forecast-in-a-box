/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/**
 * Mock Fable Data
 *
 * Test data for fable builder features.
 * Uses the new backend format with PluginCompositeId structure.
 *
 * Note: The backend returns catalogue keys in Python repr format: "store='ecmwf' local='toy1'"
 * The frontend normalizes these to display format: "ecmwf/toy1"
 */

import type {
  BlockFactory,
  BlockFactoryCatalogue,
  FableBuilderV1,
  PluginBlockFactoryId,
} from '@/api/types/fable.types'
import type { PluginCompositeId } from '@/api/types/plugins.types'
import { getFactory } from '@/api/types/fable.types'

/**
 * Helper to create a PluginCompositeId
 */
function pluginId(store: string, local: string): PluginCompositeId {
  return { store, local }
}

/**
 * Mock catalogue in normalized display format (keys use "store/local" format)
 *
 * Note: The actual backend returns keys in Python repr format "store='...' local='...'",
 * but the frontend normalizes these to display format when fetching via useBlockCatalogue.
 * This mock is already in display format for direct use with getFactory() helper.
 */
export const mockCatalogue: BlockFactoryCatalogue = {
  // ECMWF base plugin - matches live backend exactly
  ['ecmwf/ecmwf-base']: {
    factories: {
      ekdSource: {
        kind: 'source',
        title: 'Earthkit Data Source',
        description: 'Fetch data from mars or ecmwf open data',
        configuration_options: {
          source: {
            title: 'Source',
            description: 'Top level source for earthkit data',
            value_type: "enum['mars', 'ecmwf-open-data']",
          },
          date: {
            title: 'Date',
            description: 'The date dimension of the data',
            value_type: 'date-iso8601',
          },
          expver: {
            title: 'Expver',
            description: 'The expver value of the forecast',
            value_type: 'str',
          },
        },
        inputs: [],
      },
      ensembleStatistics: {
        kind: 'product',
        title: 'Ensemble Statistics',
        description: 'Computes ensemble mean or standard deviation',
        configuration_options: {
          variable: {
            title: 'Variable',
            description: "Variable name like '2t'",
            value_type: 'str',
          },
          statistic: {
            title: 'Statistic',
            description: 'Statistic to compute over the ensemble',
            value_type: "enum['mean', 'std']",
          },
        },
        inputs: ['dataset'],
      },
      temporalStatistics: {
        kind: 'product',
        title: 'Temporal Statistics',
        description: 'Computes temporal statistics',
        configuration_options: {
          variable: {
            title: 'Variable',
            description: "Variable name like '2t'",
            value_type: 'str',
          },
          statistic: {
            title: 'Statistic',
            description: 'Statistic to compute over steps',
            value_type: "enum['mean', 'std', 'min', 'max']",
          },
        },
        inputs: ['dataset'],
      },
      zarrSink: {
        kind: 'sink',
        title: 'Zarr Sink',
        description: 'Write dataset to a zarr on the local filesystem',
        configuration_options: {
          path: {
            title: 'Zarr Path',
            description: 'Filesystem path where the zarr should be written',
            value_type: 'str',
          },
        },
        inputs: ['dataset'],
      },
    },
  },

  ['ecmwf/anemoi-inference']: {
    factories: {
      model_forecast: {
        kind: 'source',
        title: 'Compute Model Forecast',
        description: 'Download initial conditions, run model forecast',
        configuration_options: {
          model: {
            title: 'Model Name',
            description: 'Locally available checkpoint to run',
            value_type: 'str',
          },
          date: {
            title: 'Initial Conditions DateTime',
            description: 'DateTime of the initial conditions',
            value_type: 'datetime',
          },
          lead_time: {
            title: 'Lead Time',
            description: 'Lead Time of the forecast in hours',
            value_type: 'int',
          },
          ensemble_members: {
            title: 'Ensemble Members',
            description: 'How many ensemble members to use',
            value_type: 'int',
          },
        },
        inputs: [],
      },
    },
  },

  ['ecmwf/mars-connector']: {
    factories: {
      mars_aifs_external: {
        kind: 'source',
        title: 'Download AIFS Forecast',
        description: 'Download an existing published AIFS forecast from MARS',
        configuration_options: {
          date: {
            title: 'Initial Conditions DateTime',
            description: 'DateTime of the initial conditions',
            value_type: 'datetime',
          },
          lead_time: {
            title: 'Lead Time',
            description: 'Lead Time of the forecast in hours',
            value_type: 'int',
          },
        },
        inputs: [],
      },
    },
  },

  ['ecmwf/fiab-products']: {
    factories: {
      product_123: {
        kind: 'product',
        title: 'Thingily-Dingily Index',
        description: 'Calculate the Thingily-Dingily index',
        configuration_options: {
          variables: {
            title: 'Variables',
            description:
              'Which variables (st, precip, cc, ...) to compute the index for',
            value_type: 'list[str]',
          },
          'thingily-dingily-coefficient': {
            title: 'Thingily-Dingily Coefficient',
            description: 'Coefficient of the Thingily-Dingiliness',
            value_type: 'float',
          },
        },
        inputs: ['forecast'],
      },

      product_456: {
        kind: 'product',
        title: 'Comparity-Romparity Ratio',
        description:
          'Estimate the Comparity-Romparity ratio between two forecasts',
        configuration_options: {},
        inputs: ['forecast1', 'forecast2'],
      },

      variable_filter: {
        kind: 'product',
        title: 'Variable Filter',
        description: 'Select specific variables from the forecast data',
        configuration_options: {
          variables: {
            title: 'Variables',
            description:
              'Select which variables to include (temp_2m, wind_u, wind_v, precip, etc.)',
            value_type: 'list[str]',
          },
          interpolation_method: {
            title: 'Interpolation Method',
            description: 'Method used for spatial interpolation',
            value_type: 'str',
          },
        },
        inputs: ['forecast'],
      },

      region_subset: {
        kind: 'product',
        title: 'Region Subset',
        description: 'Extract a geographic region from the data',
        configuration_options: {
          north: {
            title: 'North Latitude',
            description: 'Northern boundary (degrees)',
            value_type: 'float',
          },
          south: {
            title: 'South Latitude',
            description: 'Southern boundary (degrees)',
            value_type: 'float',
          },
          east: {
            title: 'East Longitude',
            description: 'Eastern boundary (degrees)',
            value_type: 'float',
          },
          west: {
            title: 'West Longitude',
            description: 'Western boundary (degrees)',
            value_type: 'float',
          },
        },
        inputs: ['data'],
      },
    },
  },

  ['ecmwf/fiab-sinks']: {
    factories: {
      store_local_fdb: {
        kind: 'sink',
        title: 'Local FDB Persistence',
        description: 'Store any GRIB data to local FDB',
        configuration_options: {
          fdb_key_prefix: {
            title: 'FDB Prefix',
            description: 'Like /experiments/run123',
            value_type: 'str',
          },
        },
        inputs: ['data'],
      },

      plot: {
        kind: 'sink',
        title: 'Visualize',
        description: 'Visualize the result as a plot',
        configuration_options: {
          ekp_subcommand: {
            title: 'Earthkit-Plots Subcommand',
            description: 'Full subcommand as understood by earthkit-plots',
            value_type: 'str',
          },
        },
        inputs: ['data'],
      },

      api_output: {
        kind: 'sink',
        title: 'API Output',
        description: 'Expose data through REST API endpoint',
        configuration_options: {
          endpoint_path: {
            title: 'Endpoint Path',
            description: 'URL path for the API endpoint',
            value_type: 'str',
          },
          format: {
            title: 'Output Format',
            description: 'Data format (json, geojson, csv)',
            value_type: 'str',
          },
        },
        inputs: ['data'],
      },
    },
  },
}

/**
 * Get blocks grouped by kind for UI display
 */
export function getBlocksByKind(
  catalogue: BlockFactoryCatalogue,
): Record<string, Array<{ id: PluginBlockFactoryId; factory: BlockFactory }>> {
  const result: Record<
    string,
    Array<{ id: PluginBlockFactoryId; factory: BlockFactory }>
  > = {
    source: [],
    transform: [],
    product: [],
    sink: [],
  }

  for (const [pluginKey, pluginCatalogue] of Object.entries(catalogue)) {
    // Parse the plugin key (could be Python repr or display format)
    let plugin: PluginCompositeId
    if (pluginKey.includes("store='") && pluginKey.includes("local='")) {
      // Python repr format
      const storeMatch = pluginKey.match(/store='([^']+)'/)
      const localMatch = pluginKey.match(/local='([^']+)'/)
      plugin = {
        store: storeMatch?.[1] ?? '',
        local: localMatch?.[1] ?? '',
      }
    } else if (pluginKey.includes('/')) {
      // Display format
      const slashIndex = pluginKey.indexOf('/')
      plugin = {
        store: pluginKey.substring(0, slashIndex),
        local: pluginKey.substring(slashIndex + 1),
      }
    } else {
      // Fallback - treat as local name only
      plugin = { store: '', local: pluginKey }
    }

    for (const [factoryId, factory] of Object.entries(
      pluginCatalogue.factories,
    )) {
      result[factory.kind].push({
        id: { plugin, factory: factoryId },
        factory,
      })
    }
  }

  return result
}

/**
 * Mock saved fables with new PluginBlockFactoryId format
 */
export const mockSavedFables: Record<
  string,
  {
    fable: FableBuilderV1
    name: string
    tags: Array<string>
    user_id: string
    created_at: string
    updated_at: string
  }
> = {
  'fable-001': {
    fable: {
      blocks: {
        block_source_1: {
          factory_id: {
            plugin: pluginId('ecmwf', 'anemoi-inference'),
            factory: 'model_forecast',
          },
          configuration_values: {
            model: 'aifs/single-mse-v0.2.1',
            date: '2024-01-15T00:00:00Z',
            lead_time: '24',
            ensemble_members: '4',
          },
          input_ids: {},
        },
        block_product_1: {
          factory_id: {
            plugin: pluginId('ecmwf', 'fiab-products'),
            factory: 'variable_filter',
          },
          configuration_values: {
            variables: 'temp_2m,wind_u,wind_v',
            interpolation_method: 'linear',
          },
          input_ids: {
            forecast: 'block_source_1',
          },
        },
        block_sink_1: {
          factory_id: {
            plugin: pluginId('ecmwf', 'fiab-sinks'),
            factory: 'plot',
          },
          configuration_values: {
            ekp_subcommand: 'contour --variable temp_2m',
          },
          input_ids: {
            data: 'block_product_1',
          },
        },
      },
    },
    name: 'European Temperature Forecast',
    tags: ['europe', 'temperature', 'daily'],
    user_id: 'user-123',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },

  'fable-002': {
    fable: {
      blocks: {
        block_aifs_1: {
          factory_id: {
            plugin: pluginId('ecmwf', 'mars-connector'),
            factory: 'mars_aifs_external',
          },
          configuration_values: {
            date: '2024-01-14T12:00:00Z',
            lead_time: '48',
          },
          input_ids: {},
        },
        block_store_1: {
          factory_id: {
            plugin: pluginId('ecmwf', 'fiab-sinks'),
            factory: 'store_local_fdb',
          },
          configuration_values: {
            fdb_key_prefix: '/experiments/aifs_download_test',
          },
          input_ids: {
            data: 'block_aifs_1',
          },
        },
      },
    },
    name: 'AIFS Download and Store',
    tags: ['aifs', 'archive'],
    user_id: 'user-123',
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-01-12T08:00:00Z',
  },
}

/**
 * Calculate expansion (validation) for a fable
 *
 * Returns validation errors and possible next blocks that can be added.
 */
export function calculateExpansion(fable: FableBuilderV1): {
  global_errors: Array<string>
  block_errors: Record<string, Array<string>>
  possible_sources: Array<PluginBlockFactoryId>
  possible_expansions: Record<string, Array<PluginBlockFactoryId>>
} {
  const block_errors: Record<string, Array<string>> = {}
  const possible_expansions: Record<string, Array<PluginBlockFactoryId>> = {}

  // Available blocks by kind (using new PluginCompositeId format)
  const sourceBlocks: Array<PluginBlockFactoryId> = [
    { plugin: pluginId('ecmwf', 'ecmwf-base'), factory: 'ekdSource' },
    {
      plugin: pluginId('ecmwf', 'anemoi-inference'),
      factory: 'model_forecast',
    },
    {
      plugin: pluginId('ecmwf', 'mars-connector'),
      factory: 'mars_aifs_external',
    },
  ]
  const productBlocks: Array<PluginBlockFactoryId> = [
    {
      plugin: pluginId('ecmwf', 'ecmwf-base'),
      factory: 'ensembleStatistics',
    },
    {
      plugin: pluginId('ecmwf', 'ecmwf-base'),
      factory: 'temporalStatistics',
    },
    { plugin: pluginId('ecmwf', 'fiab-products'), factory: 'product_123' },
    { plugin: pluginId('ecmwf', 'fiab-products'), factory: 'product_456' },
    { plugin: pluginId('ecmwf', 'fiab-products'), factory: 'variable_filter' },
    { plugin: pluginId('ecmwf', 'fiab-products'), factory: 'region_subset' },
  ]
  const sinkBlocks: Array<PluginBlockFactoryId> = [
    { plugin: pluginId('ecmwf', 'ecmwf-base'), factory: 'zarrSink' },
    { plugin: pluginId('ecmwf', 'fiab-sinks'), factory: 'store_local_fdb' },
    { plugin: pluginId('ecmwf', 'fiab-sinks'), factory: 'plot' },
    { plugin: pluginId('ecmwf', 'fiab-sinks'), factory: 'api_output' },
  ]

  for (const [blockId, instance] of Object.entries(fable.blocks)) {
    const errors: Array<string> = []

    const factory = getFactory(mockCatalogue, instance.factory_id)
    if (!factory) {
      const pluginDisplay = `${instance.factory_id.plugin.store}/${instance.factory_id.plugin.local}`
      errors.push(
        `Block factory '${pluginDisplay}:${instance.factory_id.factory}' not found`,
      )
      block_errors[blockId] = errors
      continue
    }

    // Check for missing required config
    for (const configKey of Object.keys(factory.configuration_options)) {
      const value = instance.configuration_values[configKey]
      if (!value || value.trim() === '') {
        errors.push(`Missing required configuration: ${configKey}`)
      }
    }

    // Check for missing inputs
    for (const inputName of factory.inputs) {
      const sourceId = instance.input_ids[inputName]

      if (!sourceId || sourceId.trim() === '') {
        errors.push(`Missing required input: ${inputName}`)
      } else if (!(sourceId in fable.blocks)) {
        errors.push(`Input '${inputName}' references non-existent block`)
      }
    }

    if (errors.length > 0) {
      block_errors[blockId] = errors
    }

    // Calculate possible expansions based on block kind
    if (factory.kind === 'source') {
      possible_expansions[blockId] = productBlocks
    } else if (factory.kind === 'product') {
      possible_expansions[blockId] = sinkBlocks
    }
  }

  return {
    global_errors: [],
    block_errors,
    possible_sources: sourceBlocks,
    possible_expansions,
  }
}
