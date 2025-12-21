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
 */

import type { PluginInfo, PluginStore } from '@/api/types/plugins.types'

export const mockStores: Array<PluginStore> = [
  {
    id: 'ecmwf-fiab-store',
    name: 'ECMWF Plugin Store',
    url: 'https://plugins.fiab.ecmwf.int',
    isDefault: true,
    isConnected: true,
    pluginsCount: 15,
  },
]

export const mockPlugins: Array<PluginInfo> = [
  // Default source plugins (cannot be uninstalled)
  {
    id: 'ecmwf/anemoi-inference',
    name: 'Anemoi Inference',
    description:
      'ECMWF Anemoi machine learning inference engine for running AI weather models.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.0.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['source'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-01-01T00:00:00Z',
    iconName: 'Brain',
    store: 'ecmwf-fiab-store',
    isDefault: true,
  },
  {
    id: 'ecmwf/aifs-dataset',
    name: 'AIFS Forecast Dataset',
    description:
      'Access ECMWF AIFS (Artificial Intelligence Forecasting System) forecast datasets as input source.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.0.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['source'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-01-01T00:00:00Z',
    iconName: 'Database',
    store: 'ecmwf-fiab-store',
    isDefault: true,
  },
  // Plugins with updates available
  {
    id: 'ecmwf/ensemble-forecast',
    name: 'ECMWF Ensemble',
    description:
      'AI-based ensemble forecasting using ECMWF model architecture.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '2.1.0',
    latestVersion: '2.4.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['source'],
    status: 'update_available',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: true,
    installedAt: '2025-09-01T10:00:00Z',
    iconName: 'Globe',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/frost-connector',
    name: 'Historical Weather API',
    description:
      'Connect to historical weather observation APIs for data analysis.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.0.0',
    latestVersion: '1.1.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['source'],
    status: 'update_available',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: true,
    installedAt: '2025-08-15T08:30:00Z',
    iconName: 'Droplets',
    store: 'ecmwf-fiab-store',
  },
  // Active plugins
  {
    id: 'ecmwf/wind-pattern-ai',
    name: 'ECMWF Wind Pattern AI',
    description: 'Neural network for predicting jet stream shifts.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '3.0.2',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['product'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-12-09T14:00:00Z',
    iconName: 'Wind',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/thermal-mapper',
    name: 'Thermal Mapper',
    description: 'Visualizes temperature gradients across topographic layers.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '4.1.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['sink'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-12-06T09:15:00Z',
    iconName: 'Thermometer',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/regridding',
    name: 'ECMWF Regridding',
    description:
      'High-performance regridding and interpolation for forecast datasets.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '2.0.5',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['transform'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-12-04T11:30:00Z',
    iconName: 'Globe',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/grib-export',
    name: 'GRIB Export',
    description: 'Export forecast data in GRIB format for meteorological use.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '2.1.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['sink'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-10-20T16:45:00Z',
    iconName: 'FileOutput',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/netcdf-export',
    name: 'NetCDF Export',
    description:
      'Export forecast data in NetCDF format for scientific analysis.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.5.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['sink'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-10-18T10:00:00Z',
    iconName: 'Database',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/ocean-current',
    name: 'Ocean Current Analyzer',
    description: 'Tracks and predicts North Atlantic and Arctic currents.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.2.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['product'],
    status: 'active',
    isEnabled: true,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-11-05T08:00:00Z',
    iconName: 'Waves',
    store: 'ecmwf-fiab-store',
  },
  // Disabled plugins
  {
    id: 'ecmwf/precipitation',
    name: 'Precipitation Visualizer',
    description: 'Legacy module for rain density visualization.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.2.0',
    fiabCompatibility: '>=0.8.0',
    capabilities: ['sink'],
    status: 'disabled',
    isEnabled: false,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-11-01T12:00:00Z',
    iconName: 'CloudRain',
    store: 'ecmwf-fiab-store',
  },
  {
    id: 'ecmwf/legacy-viz',
    name: 'Legacy Visualizer',
    description: 'Deprecated visualization module for older forecast formats.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '0.9.5',
    fiabCompatibility: '>=0.5.0',
    capabilities: ['sink'],
    status: 'disabled',
    isEnabled: false,
    isInstalled: true,
    hasUpdate: false,
    installedAt: '2025-06-15T14:30:00Z',
    iconName: 'ImageOff',
    store: 'ecmwf-fiab-store',
  },
  // Uninstalled plugins (not installed)
  {
    id: 'ecmwf/anemoi-storm-tracker',
    name: 'Anemoi Storm Tracker',
    description:
      'ML-based severe weather tracking module for Anemoi inference pipelines.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '3.0.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['product'],
    status: 'uninstalled',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'Tornado',
    store: 'ecmwf-fiab-store',
    releaseDate: '2026-01-05T00:00:00Z', // Within last month - should show "New"
  },
  {
    id: 'ecmwf/snow-analysis',
    name: 'Snow Analysis',
    description: 'Analyze and forecast snow accumulation patterns.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '2.0.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['product'],
    status: 'uninstalled',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'Snowflake',
    store: 'ecmwf-fiab-store',
    releaseDate: '2025-12-20T00:00:00Z', // Within last month - should show "New"
  },
  {
    id: 'ecmwf/pproc-visualization',
    name: 'PProc Visualization Suite',
    description:
      'Advanced visualization tools for PProc post-processing outputs and diagnostics.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.0.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['sink'],
    status: 'uninstalled',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'BarChart3',
    store: 'ecmwf-fiab-store',
    releaseDate: '2025-09-15T00:00:00Z', // Older release
  },
  {
    id: 'ecmwf/pdf-export',
    name: 'PDF Report Generator',
    description: 'Generate professional PDF reports from forecast data.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.5.0',
    fiabCompatibility: '>=1.0.0',
    capabilities: ['sink'],
    status: 'uninstalled',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'FileText',
    store: 'ecmwf-fiab-store',
    releaseDate: '2025-11-01T00:00:00Z', // Older release
  },
  // Incompatible plugins
  {
    id: 'ecmwf/anemoi-training',
    name: 'Anemoi Training Module',
    description:
      'Advanced training and fine-tuning capabilities for Anemoi weather models.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '1.0.0',
    fiabCompatibility: '>=2.0.0',
    capabilities: ['source', 'product'],
    status: 'incompatible',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'Cpu',
    store: 'ecmwf-fiab-store',
    releaseDate: '2026-01-10T00:00:00Z', // Within last month - should show "New"
  },
  {
    id: 'ecmwf/anemoi-probabilistic',
    name: 'Anemoi Probabilistic Ensemble',
    description:
      'Probabilistic ensemble generation and uncertainty quantification for Anemoi forecasts.',
    author: 'ECMWF',
    authorUrl: 'https://ecmwf.int',
    version: '0.5.0',
    fiabCompatibility: '>=2.5.0',
    capabilities: ['product'],
    status: 'incompatible',
    isEnabled: false,
    isInstalled: false,
    hasUpdate: false,
    iconName: 'Layers',
    store: 'ecmwf-fiab-store',
    releaseDate: '2025-08-01T00:00:00Z', // Older release
  },
]

/**
 * Get plugins with updates available
 */
export function getPluginsWithUpdates(): Array<PluginInfo> {
  return mockPlugins.filter((p) => p.hasUpdate)
}

/**
 * Get installed plugins
 */
export function getInstalledPlugins(): Array<PluginInfo> {
  return mockPlugins.filter((p) => p.isInstalled)
}

/**
 * Get uninstalled plugins (not installed)
 */
export function getUninstalledPlugins(): Array<PluginInfo> {
  return mockPlugins.filter(
    (p) => p.status === 'uninstalled' || p.status === 'incompatible',
  )
}
