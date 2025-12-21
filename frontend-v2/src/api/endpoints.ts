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
 * API Endpoints - Single Source of Truth
 *
 * All API endpoint paths are defined here. Import and use these
 * constants instead of hardcoding paths.
 *
 * Key conventions:
 * - `API_ENDPOINTS`: For production code - static paths or functions for dynamic paths
 * - `API_PATTERNS`: For MSW mock handlers - uses `:param` syntax for path matching
 *
 * @see AGENTS.md for documentation on API endpoint conventions
 */

/**
 * API version
 */
export const API_VERSION = 'v1'

/**
 * API path prefix (includes version)
 */
export const API_PREFIX = `/api/${API_VERSION}`

/**
 * All API endpoint paths for production code
 *
 * Static endpoints are strings, dynamic endpoints are functions.
 *
 * Usage:
 * ```typescript
 * import { API_ENDPOINTS } from '@/api/endpoints'
 *
 * // Static endpoint
 * apiClient.get(API_ENDPOINTS.status)
 *
 * // Dynamic endpoint
 * apiClient.get(API_ENDPOINTS.sources.byId(sourceId))
 * ```
 */
export const API_ENDPOINTS = {
  /**
   * System status endpoint
   */
  status: `${API_PREFIX}/status`,

  /**
   * Fable (configuration builder) endpoints
   */
  fable: {
    /** GET - Get block catalogue */
    catalogue: `${API_PREFIX}/fable/catalogue`,
    /** POST - Expand a fable configuration */
    expand: `${API_PREFIX}/fable/expand`,
    /** POST - Compile a fable configuration */
    compile: `${API_PREFIX}/fable/compile`,
    /** GET - Retrieve a saved fable */
    retrieve: `${API_PREFIX}/fable/retrieve`,
    /** POST - Create or update a fable */
    upsert: `${API_PREFIX}/fable/upsert`,
    /** GET - List all saved fables */
    list: `${API_PREFIX}/fable/list`,
  },

  /**
   * Admin/configuration endpoints
   */
  admin: {
    /** GET - Get UI configuration */
    uiConfig: `${API_PREFIX}/admin/uiConfig`,
  },

  /**
   * User endpoints
   */
  users: {
    /** GET - Get current user info */
    me: `${API_PREFIX}/users/me`,
  },

  /**
   * Authentication endpoints
   */
  auth: {
    /** POST - Logout current session */
    logout: `${API_PREFIX}/auth/logout`,
    // Note: OIDC authorize endpoint comes from backend config (loginEndpoint)
  },

  /**
   * Plugin management endpoints
   */
  plugins: {
    /** GET - List all plugins and stores */
    list: `${API_PREFIX}/plugins`,
    /** GET - List connected stores */
    stores: `${API_PREFIX}/plugins/stores`,
    /** POST - Add a new store */
    addPluginStore: `${API_PREFIX}/plugins/stores`,
    /** POST - Check for plugin updates */
    checkUpdates: `${API_PREFIX}/plugins/check-updates`,
    /** POST - Install a plugin */
    install: (pluginId: string) => `${API_PREFIX}/plugins/${pluginId}/install`,
    /** POST - Uninstall a plugin */
    uninstall: (pluginId: string) =>
      `${API_PREFIX}/plugins/${pluginId}/uninstall`,
    /** POST - Enable a plugin */
    enable: (pluginId: string) => `${API_PREFIX}/plugins/${pluginId}/enable`,
    /** POST - Disable a plugin */
    disable: (pluginId: string) => `${API_PREFIX}/plugins/${pluginId}/disable`,
    /** POST - Update a plugin */
    update: (pluginId: string) => `${API_PREFIX}/plugins/${pluginId}/update`,
  },

  /**
   * Sources management endpoints
   */
  sources: {
    /** GET - List all sources and registries */
    list: `${API_PREFIX}/sources`,
    /** GET - Get source by ID */
    byId: (sourceId: string) => `${API_PREFIX}/sources/${sourceId}`,
    /** POST - Download a source (for model type) */
    download: (sourceId: string) =>
      `${API_PREFIX}/sources/${sourceId}/download`,
    /** PUT - Enable a source */
    enable: (sourceId: string) => `${API_PREFIX}/sources/${sourceId}/enable`,
    /** PUT - Disable a source */
    disable: (sourceId: string) => `${API_PREFIX}/sources/${sourceId}/disable`,
    /** PUT - Configure a source */
    configure: (sourceId: string) =>
      `${API_PREFIX}/sources/${sourceId}/configure`,
  },

  /**
   * Source Registry management endpoints
   */
  registries: {
    /** GET - List all registries */
    list: `${API_PREFIX}/registries`,
    /** POST - Add a new registry */
    add: `${API_PREFIX}/registries`,
    /** GET - Get registry by ID */
    byId: (registryId: string) => `${API_PREFIX}/registries/${registryId}`,
    /** DELETE - Remove a registry */
    remove: (registryId: string) => `${API_PREFIX}/registries/${registryId}`,
    /** POST - Sync a registry */
    sync: (registryId: string) => `${API_PREFIX}/registries/${registryId}/sync`,
  },
} as const

/**
 * Path patterns for MSW mock handlers
 *
 * These use `:param` syntax for dynamic route matching.
 * Only needed for endpoints with path parameters.
 *
 * Usage in mock handlers:
 * ```typescript
 * import { API_PATTERNS } from '@/api/endpoints'
 *
 * http.get(API_PATTERNS.sources.byId, async ({ params }) => {
 *   const { sourceId } = params
 *   // ...
 * })
 * ```
 */
export const API_PATTERNS = {
  plugins: {
    /** Pattern: /api/v1/plugins/:pluginId/install */
    install: `${API_PREFIX}/plugins/:pluginId/install`,
    /** Pattern: /api/v1/plugins/:pluginId/uninstall */
    uninstall: `${API_PREFIX}/plugins/:pluginId/uninstall`,
    /** Pattern: /api/v1/plugins/:pluginId/enable */
    enable: `${API_PREFIX}/plugins/:pluginId/enable`,
    /** Pattern: /api/v1/plugins/:pluginId/disable */
    disable: `${API_PREFIX}/plugins/:pluginId/disable`,
    /** Pattern: /api/v1/plugins/:pluginId/update */
    update: `${API_PREFIX}/plugins/:pluginId/update`,
  },
  sources: {
    /** Pattern: /api/v1/sources/:sourceId */
    byId: `${API_PREFIX}/sources/:sourceId`,
    /** Pattern: /api/v1/sources/:sourceId/download */
    download: `${API_PREFIX}/sources/:sourceId/download`,
    /** Pattern: /api/v1/sources/:sourceId/enable */
    enable: `${API_PREFIX}/sources/:sourceId/enable`,
    /** Pattern: /api/v1/sources/:sourceId/disable */
    disable: `${API_PREFIX}/sources/:sourceId/disable`,
    /** Pattern: /api/v1/sources/:sourceId/configure */
    configure: `${API_PREFIX}/sources/:sourceId/configure`,
  },
  registries: {
    /** Pattern: /api/v1/registries/:registryId */
    byId: `${API_PREFIX}/registries/:registryId`,
    /** Pattern: /api/v1/registries/:registryId/sync */
    sync: `${API_PREFIX}/registries/:registryId/sync`,
  },
} as const

/**
 * Type helper for endpoint paths
 */
export type ApiEndpointPath = string
