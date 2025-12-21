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
 * Plugin Types and Schemas
 *
 * Type definitions and Zod schemas for plugin management API.
 * Plugins extend the Fable Graph and Form Builder functionality.
 */

import { z } from 'zod'

/**
 * Plugin status values
 *
 * - active: Plugin is installed and enabled
 * - disabled: Plugin is installed but disabled
 * - uninstalled: Plugin is not installed
 * - update_available: Plugin has an update available
 * - incompatible: Plugin is not compatible with current FIAB version
 */
export const pluginStatusValues = [
  'active',
  'disabled',
  'uninstalled',
  'update_available',
  'incompatible',
] as const
export type PluginStatus = (typeof pluginStatusValues)[number]

/**
 * Plugin capability categories
 *
 * Plugins can have one or more capabilities:
 * - source: Provides data input (external APIs, data sources)
 * - transform: Modifies/enhances data (image processing, data conversion)
 * - product: Generates forecasts/predictions (AI models, analysis)
 * - sink: Outputs data (exports, visualizations)
 */
export const pluginCapabilityValues = [
  'source',
  'transform',
  'product',
  'sink',
] as const
export type PluginCapability = (typeof pluginCapabilityValues)[number]

/**
 * Plugin information schema
 */
export const pluginInfoSchema = z.object({
  /** Unique plugin identifier (e.g., "ecmwf/anemoi-output") */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Plugin description */
  description: z.string(),
  /** Author name */
  author: z.string(),
  /** Author URL (optional) */
  authorUrl: z.string().optional(),
  /** Currently installed version */
  version: z.string(),
  /** Latest available version (if different, update available) */
  latestVersion: z.string().optional(),
  /** FIAB version compatibility (semver range, e.g., ">=1.0.0") */
  fiabCompatibility: z.string(),
  /** Plugin capabilities (source, product, sink) - can have multiple */
  capabilities: z.array(z.enum(pluginCapabilityValues)),
  /** Current status */
  status: z.enum(pluginStatusValues),
  /** Whether plugin is enabled */
  isEnabled: z.boolean(),
  /** Whether plugin is installed */
  isInstalled: z.boolean(),
  /** Whether an update is available */
  hasUpdate: z.boolean(),
  /** ISO date when installed */
  installedAt: z.string().optional(),
  /** ISO date when last updated */
  updatedAt: z.string().optional(),
  /** URL to plugin icon image */
  iconUrl: z.string().optional(),
  /** Lucide icon name fallback */
  iconName: z.string().optional(),
  /** Plugin homepage URL */
  homepage: z.string().optional(),
  /** Plugin repository URL */
  repository: z.string().optional(),
  /** Store ID this plugin belongs to */
  store: z.string(),
  /** ISO date when the plugin was released */
  releaseDate: z.string().optional(),
  /** Whether this is a default plugin (cannot be uninstalled) */
  isDefault: z.boolean().optional(),
})

export type PluginInfo = z.infer<typeof pluginInfoSchema>

/**
 * Plugin store schema
 */
export const pluginStoreSchema = z.object({
  /** Unique store identifier */
  id: z.string(),
  /** Display name */
  name: z.string(),
  /** Registry URL */
  url: z.string(),
  /** Whether this is the default ECMWF store */
  isDefault: z.boolean(),
  /** Whether currently connected */
  isConnected: z.boolean(),
  /** Number of available plugins */
  pluginsCount: z.number(),
})

export type PluginStore = z.infer<typeof pluginStoreSchema>

/**
 * Plugins list API response schema
 */
export const pluginsApiResponseSchema = z.object({
  plugins: z.array(pluginInfoSchema),
  stores: z.array(pluginStoreSchema),
})

export type PluginsApiResponse = z.infer<typeof pluginsApiResponseSchema>

/**
 * Plugin stats for dashboard display
 */
export interface PluginsStats {
  installedCount: number
  activeCount: number
  disabledCount: number
  updatesAvailableCount: number
  storesCount: number
}

/**
 * Add plugin store request
 */
export const addPluginStoreRequestSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
})

export type AddPluginStoreRequest = z.infer<typeof addPluginStoreRequestSchema>
