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
 * Plugins API Endpoints
 *
 * API functions for plugin management operations.
 */

import { z } from 'zod'
import type {
  AddPluginStoreRequest,
  PluginStore,
  PluginsApiResponse,
} from '@/api/types/plugins.types'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import {
  pluginStoreSchema,
  pluginsApiResponseSchema,
} from '@/api/types/plugins.types'

/** Response schema for plugin actions */
const pluginActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  pluginId: z.string().optional(),
})

type PluginActionResponse = z.infer<typeof pluginActionResponseSchema>

/** Response schema for add plugin store */
const addPluginStoreResponseSchema = z.object({
  success: z.boolean(),
  store: pluginStoreSchema.optional(),
})

type AddPluginStoreResponse = z.infer<typeof addPluginStoreResponseSchema>

/** Response schema for check updates */
const checkUpdatesResponseSchema = z.object({
  success: z.boolean(),
  updatesCount: z.number(),
  plugins: z.array(z.unknown()),
})

type CheckUpdatesResponse = z.infer<typeof checkUpdatesResponseSchema>

/**
 * Get all plugins and stores
 */
export async function getPlugins(): Promise<PluginsApiResponse> {
  return apiClient.get(API_ENDPOINTS.plugins.list, {
    schema: pluginsApiResponseSchema,
  })
}

/**
 * Get connected plugin stores
 */
export async function getPluginStores(): Promise<{
  stores: Array<PluginStore>
}> {
  return apiClient.get(API_ENDPOINTS.plugins.stores, {
    schema: z.object({
      stores: z.array(pluginStoreSchema),
    }),
  })
}

/**
 * Add a new plugin store
 */
export async function addPluginStore(
  data: AddPluginStoreRequest,
): Promise<AddPluginStoreResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.addPluginStore, data, {
    schema: addPluginStoreResponseSchema,
  })
}

/**
 * Check for plugin updates
 */
export async function checkForUpdates(): Promise<CheckUpdatesResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.checkUpdates, undefined, {
    schema: checkUpdatesResponseSchema,
  })
}

/**
 * Install a plugin
 */
export async function installPlugin(
  pluginId: string,
): Promise<PluginActionResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.install(pluginId), undefined, {
    schema: pluginActionResponseSchema,
  })
}

/**
 * Uninstall a plugin
 */
export async function uninstallPlugin(
  pluginId: string,
): Promise<PluginActionResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.uninstall(pluginId), undefined, {
    schema: pluginActionResponseSchema,
  })
}

/**
 * Enable a plugin
 */
export async function enablePlugin(
  pluginId: string,
): Promise<PluginActionResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.enable(pluginId), undefined, {
    schema: pluginActionResponseSchema,
  })
}

/**
 * Disable a plugin
 */
export async function disablePlugin(
  pluginId: string,
): Promise<PluginActionResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.disable(pluginId), undefined, {
    schema: pluginActionResponseSchema,
  })
}

/**
 * Update a plugin to latest version
 */
export async function updatePlugin(
  pluginId: string,
): Promise<PluginActionResponse> {
  return apiClient.post(API_ENDPOINTS.plugins.update(pluginId), undefined, {
    schema: pluginActionResponseSchema,
  })
}
