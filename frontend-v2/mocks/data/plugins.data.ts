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
 * Mock Plugin Data
 *
 * Test data for plugin management features.
 * Uses the new backend format with PluginListing structure.
 */

import type { PluginDetail, PluginListing } from '@/api/types/plugins.types'

/**
 * Helper to create a Python repr format plugin key
 */
function createPluginKey(store: string, local: string): string {
  return `store='${store}' local='${local}'`
}

/**
 * Mock plugin data in backend format
 */
export const mockPluginListing: PluginListing = {
  plugins: {
    // Loaded plugins (installed and running)
    [createPluginKey('ecmwf', 'anemoi-inference')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'anemoi-inference',
        module_name: 'anemoi_inference',
        display_title: 'Anemoi Inference',
        display_description:
          'ECMWF Anemoi machine learning inference engine for running AI weather models.',
        display_author: 'ECMWF',
        comment: 'Core plugin for ML inference',
      },
      remote_info: { version: '1.0.0' },
      errored_detail: null,
      loaded_version: '1.0.0',
      update_date: '2025/01/01',
    },
    [createPluginKey('ecmwf', 'aifs-dataset')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'aifs-dataset',
        module_name: 'aifs_dataset',
        display_title: 'AIFS Forecast Dataset',
        display_description:
          'Access ECMWF AIFS (Artificial Intelligence Forecasting System) forecast datasets as input source.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '1.0.0' },
      errored_detail: null,
      loaded_version: '1.0.0',
      update_date: '2025/01/01',
    },
    [createPluginKey('ecmwf', 'regridding')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'ecmwf-regridding',
        module_name: 'ecmwf_regridding',
        display_title: 'ECMWF Regridding',
        display_description:
          'High-performance regridding and interpolation for forecast datasets.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '2.0.5' },
      errored_detail: null,
      loaded_version: '2.0.5',
      update_date: '2025/12/04',
    },
    [createPluginKey('ecmwf', 'grib-export')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'grib-export',
        module_name: 'grib_export',
        display_title: 'GRIB Export',
        display_description:
          'Export forecast data in GRIB format for meteorological use.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '2.1.0' },
      errored_detail: null,
      loaded_version: '2.1.0',
      update_date: '2025/10/20',
    },

    // Plugin with update available
    [createPluginKey('ecmwf', 'ensemble-forecast')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'ecmwf-ensemble',
        module_name: 'ecmwf_ensemble',
        display_title: 'ECMWF Ensemble',
        display_description:
          'AI-based ensemble forecasting using ECMWF model architecture.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '2.4.0' },
      errored_detail: null,
      loaded_version: '2.1.0',
      update_date: '2025/09/01',
    },

    // Disabled plugin
    [createPluginKey('ecmwf', 'precipitation')]: {
      status: 'disabled',
      store_info: {
        pip_source: 'precipitation-viz',
        module_name: 'precipitation_viz',
        display_title: 'Precipitation Visualizer',
        display_description: 'Legacy module for rain density visualization.',
        display_author: 'ECMWF',
        comment: 'Deprecated - use new visualizer instead',
      },
      remote_info: { version: '1.2.0' },
      errored_detail: null,
      loaded_version: '1.2.0',
      update_date: '2025/11/01',
    },

    // Errored plugin
    [createPluginKey('ecmwf', 'legacy-viz')]: {
      status: 'errored',
      store_info: {
        pip_source: 'legacy-visualizer',
        module_name: 'legacy_viz',
        display_title: 'Legacy Visualizer',
        display_description:
          'Deprecated visualization module for older forecast formats.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '0.9.5' },
      errored_detail: 'Failed to load module: incompatible with Python 3.12',
      loaded_version: '0.9.5',
      update_date: '2025/06/15',
    },

    // Available plugins (not installed)
    [createPluginKey('ecmwf', 'anemoi-storm-tracker')]: {
      status: 'available',
      store_info: {
        pip_source: 'anemoi-storm-tracker',
        module_name: 'anemoi_storm_tracker',
        display_title: 'Anemoi Storm Tracker',
        display_description:
          'ML-based severe weather tracking module for Anemoi inference pipelines.',
        display_author: 'ECMWF',
        comment: 'New plugin!',
      },
      remote_info: { version: '3.0.0' },
      errored_detail: null,
      loaded_version: null,
      update_date: null,
    },
    [createPluginKey('ecmwf', 'snow-analysis')]: {
      status: 'available',
      store_info: {
        pip_source: 'snow-analysis',
        module_name: 'snow_analysis',
        display_title: 'Snow Analysis',
        display_description: 'Analyze and forecast snow accumulation patterns.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '2.0.0' },
      errored_detail: null,
      loaded_version: null,
      update_date: null,
    },
    [createPluginKey('ecmwf', 'netcdf-export')]: {
      status: 'available',
      store_info: {
        pip_source: 'netcdf-export',
        module_name: 'netcdf_export',
        display_title: 'NetCDF Export',
        display_description:
          'Export forecast data in NetCDF format for scientific analysis.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '1.5.0' },
      errored_detail: null,
      loaded_version: null,
      update_date: null,
    },
    [createPluginKey('ecmwf', 'pdf-export')]: {
      status: 'available',
      store_info: {
        pip_source: 'pdf-report-generator',
        module_name: 'pdf_export',
        display_title: 'PDF Report Generator',
        display_description:
          'Generate professional PDF reports from forecast data.',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '1.5.0' },
      errored_detail: null,
      loaded_version: null,
      update_date: null,
    },

    // Plugin with unparseable "unknown" date (backend can return this)
    [createPluginKey('ecmwf', 'toy1')]: {
      status: 'errored',
      store_info: null,
      remote_info: null,
      errored_detail: 'Plugin store info unavailable',
      loaded_version: '0.1.0',
      update_date: 'unknown',
    },
  },
}

/**
 * Get a mutable copy of the plugin listing for mock handlers
 */
export function getMutablePluginListing(): PluginListing {
  return JSON.parse(JSON.stringify(mockPluginListing)) as PluginListing
}

/**
 * Find a plugin by composite ID key
 */
export function findPluginByKey(
  listing: PluginListing,
  store: string,
  local: string,
): PluginDetail | undefined {
  const key = createPluginKey(store, local)
  return listing.plugins[key]
}

/**
 * Update a plugin in the listing
 */
export function updatePluginInListing(
  listing: PluginListing,
  store: string,
  local: string,
  updates: Partial<PluginDetail>,
): void {
  const key = createPluginKey(store, local)
  const existing = listing.plugins[key] as PluginDetail | undefined
  if (existing) {
    listing.plugins[key] = { ...existing, ...updates }
  }
}
