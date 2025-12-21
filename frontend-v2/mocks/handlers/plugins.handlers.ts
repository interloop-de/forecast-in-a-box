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
 * MSW Handlers for Plugins API
 */

import { HttpResponse, delay, http } from 'msw'
import { mockPlugins, mockStores } from '../data/plugins.data'
import type { PluginInfo, PluginStore } from '@/api/types/plugins.types'
import { API_ENDPOINTS, API_PATTERNS } from '@/api/endpoints'

// Mutable copy for state changes
let pluginsState: Array<PluginInfo> = [...mockPlugins]
let storesState: Array<PluginStore> = [...mockStores]

export const pluginsHandlers = [
  // Get all plugins and stores
  http.get(API_ENDPOINTS.plugins.list, async () => {
    await delay(300)
    return HttpResponse.json({
      plugins: pluginsState,
      stores: storesState,
    })
  }),

  // Get stores
  http.get(API_ENDPOINTS.plugins.stores, async () => {
    await delay(200)
    return HttpResponse.json({
      stores: storesState,
    })
  }),

  // Add plugin store
  http.post(API_ENDPOINTS.plugins.addPluginStore, async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as { name: string; url: string }

    const newStore: PluginStore = {
      id: `custom-${Date.now()}`,
      name: body.name,
      url: body.url,
      isDefault: false,
      isConnected: true,
      pluginsCount: 0,
    }

    storesState = [...storesState, newStore]

    return HttpResponse.json({
      success: true,
      store: newStore,
    })
  }),

  // Check for updates
  http.post(API_ENDPOINTS.plugins.checkUpdates, async () => {
    await delay(1000)
    const updatesAvailable = pluginsState.filter((p) => p.hasUpdate)
    return HttpResponse.json({
      success: true,
      updatesCount: updatesAvailable.length,
      plugins: updatesAvailable,
    })
  }),

  // Install plugin
  http.post(API_PATTERNS.plugins.install, async ({ params }) => {
    await delay(800)
    const { pluginId } = params as { pluginId: string }

    const pluginIndex = pluginsState.findIndex((p) => p.id === pluginId)
    if (pluginIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    // Update plugin state
    pluginsState = pluginsState.map((p) =>
      p.id === pluginId
        ? {
            ...p,
            isInstalled: true,
            isEnabled: true,
            status: 'active' as const,
            installedAt: new Date().toISOString(),
          }
        : p,
    )

    return HttpResponse.json({
      success: true,
      message: 'Plugin installed successfully',
      pluginId,
    })
  }),

  // Uninstall plugin
  http.post(API_PATTERNS.plugins.uninstall, async ({ params }) => {
    await delay(500)
    const { pluginId } = params as { pluginId: string }

    const pluginIndex = pluginsState.findIndex((p) => p.id === pluginId)
    if (pluginIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    // Update plugin state
    pluginsState = pluginsState.map((p) =>
      p.id === pluginId
        ? {
            ...p,
            isInstalled: false,
            isEnabled: false,
            status: 'uninstalled' as const,
            installedAt: undefined,
          }
        : p,
    )

    return HttpResponse.json({
      success: true,
      message: 'Plugin uninstalled successfully',
      pluginId,
    })
  }),

  // Enable plugin
  http.post(API_PATTERNS.plugins.enable, async ({ params }) => {
    await delay(300)
    const { pluginId } = params as { pluginId: string }

    const plugin = pluginsState.find((p) => p.id === pluginId)
    if (!plugin) {
      return new HttpResponse(null, { status: 404 })
    }

    if (!plugin.isInstalled) {
      return HttpResponse.json(
        { success: false, message: 'Plugin must be installed first' },
        { status: 400 },
      )
    }

    // Update plugin state
    pluginsState = pluginsState.map((p) =>
      p.id === pluginId
        ? {
            ...p,
            isEnabled: true,
            status: p.hasUpdate
              ? ('update_available' as const)
              : ('active' as const),
          }
        : p,
    )

    return HttpResponse.json({
      success: true,
      message: 'Plugin enabled',
      pluginId,
    })
  }),

  // Disable plugin
  http.post(API_PATTERNS.plugins.disable, async ({ params }) => {
    await delay(300)
    const { pluginId } = params as { pluginId: string }

    const plugin = pluginsState.find((p) => p.id === pluginId)
    if (!plugin) {
      return new HttpResponse(null, { status: 404 })
    }

    // Update plugin state
    pluginsState = pluginsState.map((p) =>
      p.id === pluginId
        ? {
            ...p,
            isEnabled: false,
            status: 'disabled' as const,
          }
        : p,
    )

    return HttpResponse.json({
      success: true,
      message: 'Plugin disabled',
      pluginId,
    })
  }),

  // Update plugin
  http.post(API_PATTERNS.plugins.update, async ({ params }) => {
    await delay(1000)
    const { pluginId } = params as { pluginId: string }

    const plugin = pluginsState.find((p) => p.id === pluginId)
    if (!plugin) {
      return new HttpResponse(null, { status: 404 })
    }

    if (!plugin.hasUpdate) {
      return HttpResponse.json(
        { success: false, message: 'No update available' },
        { status: 400 },
      )
    }

    // Update plugin state
    pluginsState = pluginsState.map((p) =>
      p.id === pluginId
        ? {
            ...p,
            version: p.latestVersion || p.version,
            latestVersion: undefined,
            hasUpdate: false,
            status: p.isEnabled ? ('active' as const) : ('disabled' as const),
            updatedAt: new Date().toISOString(),
          }
        : p,
    )

    return HttpResponse.json({
      success: true,
      message: 'Plugin updated successfully',
      pluginId,
    })
  }),
]
