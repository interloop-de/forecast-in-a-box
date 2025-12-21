/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { worker } from '@tests/../mocks/browser'
import {
  addPluginStore,
  checkForUpdates,
  disablePlugin,
  enablePlugin,
  getPluginStores,
  getPlugins,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
} from '@/api/endpoints/plugins'
import { API_ENDPOINTS } from '@/api/endpoints'

// Mock the env module
vi.mock('@/utils/env', () => ({
  getBackendBaseUrl: vi.fn(() => ''),
}))

describe('getPlugins', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches plugins list successfully', async () => {
    const mockResponse = {
      plugins: [
        {
          id: 'plugin-1',
          name: 'Test Plugin',
          version: '1.0.0',
          author: 'Test Author',
          description: 'A test plugin',
          fiabCompatibility: '>=1.0.0',
          capabilities: ['source'],
          status: 'active',
          isInstalled: true,
          isEnabled: true,
          hasUpdate: false,
          store: 'ecmwf',
          isDefault: false,
        },
      ],
      stores: [
        {
          id: 'store-1',
          name: 'ECMWF Store',
          url: 'https://plugins.ecmwf.int',
          isDefault: true,
          isConnected: true,
          pluginsCount: 10,
        },
      ],
    }

    worker.use(
      http.get(API_ENDPOINTS.plugins.list, () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await getPlugins()
    expect(result.plugins).toBeDefined()
    expect(result.plugins).toHaveLength(1)
    expect(result.stores).toHaveLength(1)
  })
})

describe('getPluginStores', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches plugin stores successfully', async () => {
    const mockStores = {
      stores: [
        {
          id: 'store-1',
          name: 'ECMWF Store',
          url: 'https://plugins.ecmwf.int',
          isDefault: true,
          isConnected: true,
          pluginsCount: 10,
        },
      ],
    }

    worker.use(
      http.get(API_ENDPOINTS.plugins.stores, () => {
        return HttpResponse.json(mockStores)
      }),
    )

    const result = await getPluginStores()
    expect(result.stores).toHaveLength(1)
    expect(result.stores[0].name).toBe('ECMWF Store')
  })
})

describe('addPluginStore', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('adds plugin store successfully', async () => {
    const mockResponse = {
      success: true,
      store: {
        id: 'new-store',
        name: 'New Store',
        url: 'https://new-store.example.com',
        isDefault: false,
        isConnected: true,
        pluginsCount: 0,
      },
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.addPluginStore, () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await addPluginStore({
      name: 'New Store',
      url: 'https://new-store.example.com',
    })

    expect(result.success).toBe(true)
    expect(result.store?.name).toBe('New Store')
  })
})

describe('checkForUpdates', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('checks for updates successfully', async () => {
    const mockResponse = {
      success: true,
      updatesCount: 2,
      plugins: [{ id: 'plugin-1' }, { id: 'plugin-2' }],
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.checkUpdates, () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await checkForUpdates()
    expect(result.success).toBe(true)
    expect(result.updatesCount).toBe(2)
  })
})

describe('installPlugin', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('installs plugin successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Plugin installed',
      pluginId: 'plugin-1',
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.install('plugin-1'), () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await installPlugin('plugin-1')
    expect(result.success).toBe(true)
    expect(result.pluginId).toBe('plugin-1')
  })
})

describe('uninstallPlugin', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('uninstalls plugin successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Plugin uninstalled',
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.uninstall('plugin-1'), () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await uninstallPlugin('plugin-1')
    expect(result.success).toBe(true)
  })
})

describe('enablePlugin', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('enables plugin successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Plugin enabled',
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.enable('plugin-1'), () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await enablePlugin('plugin-1')
    expect(result.success).toBe(true)
  })
})

describe('disablePlugin', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('disables plugin successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Plugin disabled',
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.disable('plugin-1'), () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await disablePlugin('plugin-1')
    expect(result.success).toBe(true)
  })
})

describe('updatePlugin', () => {
  afterEach(() => {
    worker.resetHandlers()
  })

  it('updates plugin successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Plugin updated',
    }

    worker.use(
      http.post(API_ENDPOINTS.plugins.update('plugin-1'), () => {
        return HttpResponse.json(mockResponse)
      }),
    )

    const result = await updatePlugin('plugin-1')
    expect(result.success).toBe(true)
  })
})
