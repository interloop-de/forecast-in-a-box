/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { worker } from '@tests/../mocks/browser'
import type { ReactNode } from 'react'
import type {
  PluginCompositeId,
  PluginListing,
  PluginsStatus,
} from '@/api/types/plugins.types'
import {
  pluginKeys,
  useDisablePlugin,
  useEnablePlugin,
  useInstallPlugin,
  usePluginDetails,
  usePluginStatus,
  usePlugins,
  useUninstallPlugin,
  useUpdatePlugin,
} from '@/api/hooks/usePlugins'
import { API_ENDPOINTS } from '@/api/endpoints'

// Mock the env module
vi.mock('@/utils/env', () => ({
  getBackendBaseUrl: vi.fn(() => ''),
}))

/**
 * Helper to create plugin composite ID
 */
function pluginId(store: string, local: string): PluginCompositeId {
  return { store, local }
}

/**
 * Helper to create a Python repr format plugin key
 */
function createPluginKey(store: string, local: string): string {
  return `store='${store}' local='${local}'`
}

const mockPluginListing: PluginListing = {
  plugins: {
    [createPluginKey('ecmwf', 'anemoi-inference')]: {
      status: 'loaded',
      store_info: {
        pip_source: 'anemoi-inference',
        module_name: 'anemoi_inference',
        display_title: 'Anemoi Inference',
        display_description: 'ML inference engine',
        display_author: 'ECMWF',
        comment: '',
      },
      remote_info: { version: '1.0.0' },
      errored_detail: null,
      loaded_version: '1.0.0',
      update_date: '2025/01/15',
    },
    [createPluginKey('ecmwf', 'storm-tracker')]: {
      status: 'available',
      store_info: {
        pip_source: 'storm-tracker',
        module_name: 'storm_tracker',
        display_title: 'Storm Tracker',
        display_description: 'Track severe weather',
        display_author: 'ECMWF',
        comment: 'New plugin!',
      },
      remote_info: { version: '2.0.0' },
      errored_detail: null,
      loaded_version: null,
      update_date: null,
    },
  },
}

const mockPluginStatus: PluginsStatus = {
  updater_status: 'idle',
  plugin_errors: {},
  plugin_versions: {
    [createPluginKey('ecmwf', 'anemoi-inference')]: '1.0.0',
  },
  plugin_updatedate: {
    [createPluginKey('ecmwf', 'anemoi-inference')]: '2025/01/15',
  },
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function renderWithQueryClient(
  ui: ReactNode,
  queryClient: QueryClient = createTestQueryClient(),
) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('pluginKeys', () => {
  it('generates correct all key', () => {
    expect(pluginKeys.all).toEqual(['plugin'])
  })

  it('generates correct status key', () => {
    expect(pluginKeys.status()).toEqual(['plugin', 'status'])
  })

  it('generates correct details key', () => {
    expect(pluginKeys.details()).toEqual([
      'plugin',
      'details',
      { forceRefresh: undefined },
    ])
  })

  it('generates correct details key with forceRefresh', () => {
    expect(pluginKeys.details(true)).toEqual([
      'plugin',
      'details',
      { forceRefresh: true },
    ])
  })
})

describe('usePluginStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches plugin status successfully', async () => {
    worker.use(
      http.get(API_ENDPOINTS.plugin.status, () => {
        return HttpResponse.json(mockPluginStatus)
      }),
    )

    let capturedData: ReturnType<typeof usePluginStatus> | null = null

    function TestComponent() {
      const result = usePluginStatus()
      capturedData = result
      return (
        <div data-testid="status">
          {result.isLoading ? 'loading' : 'loaded'}
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('loaded')
    expect(capturedData!.data?.updater_status).toBe('idle')
  })
})

describe('usePluginDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches plugin details successfully', async () => {
    worker.use(
      http.get(API_ENDPOINTS.plugin.details, () => {
        return HttpResponse.json(mockPluginListing)
      }),
    )

    let capturedData: ReturnType<typeof usePluginDetails> | null = null

    function TestComponent() {
      const result = usePluginDetails()
      capturedData = result
      return (
        <div data-testid="status">
          {result.isLoading ? 'loading' : 'loaded'}
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('loaded')
    expect(capturedData!.data?.plugins).toBeDefined()
    expect(Object.keys(capturedData!.data?.plugins ?? {})).toHaveLength(2)
  })
})

describe('usePlugins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('transforms plugin listing to PluginInfo array', async () => {
    worker.use(
      http.get(API_ENDPOINTS.plugin.details, () => {
        return HttpResponse.json(mockPluginListing)
      }),
    )

    let capturedData: ReturnType<typeof usePlugins> | null = null

    function TestComponent() {
      const result = usePlugins()
      capturedData = result
      return (
        <div data-testid="status">
          {result.isLoading ? 'loading' : 'loaded'}
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('loaded')
    expect(capturedData!.data?.plugins).toHaveLength(2)
    // Check that plugins are properly transformed
    const loadedPlugin = capturedData!.data?.plugins.find(
      (p) => p.id.local === 'anemoi-inference',
    )
    expect(loadedPlugin?.status).toBe('loaded')
    expect(loadedPlugin?.name).toBe('Anemoi Inference')
  })

  it('converts unparseable update_date to null', async () => {
    const listingWithUnknownDate: PluginListing = {
      plugins: {
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

    worker.use(
      http.get(API_ENDPOINTS.plugin.details, () => {
        return HttpResponse.json(listingWithUnknownDate)
      }),
    )

    let capturedData: ReturnType<typeof usePlugins> | null = null

    function TestComponent() {
      const result = usePlugins()
      capturedData = result
      return (
        <div data-testid="status">
          {result.isLoading ? 'loading' : 'loaded'}
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('loaded')
    const toy1Plugin = capturedData!.data?.plugins.find(
      (p) => p.id.local === 'toy1',
    )
    expect(toy1Plugin).toBeDefined()
    expect(toy1Plugin?.updatedAt).toBeNull()
  })
})

describe('useInstallPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('installs plugin successfully', async () => {
    const testId = pluginId('ecmwf', 'storm-tracker')

    worker.use(
      http.post(API_ENDPOINTS.plugin.install, () => {
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const result = useInstallPlugin()
      return (
        <div>
          <button data-testid="install" onClick={() => result.mutate(testId)}>
            Install
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('install').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
  })
})

describe('useUninstallPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('uninstalls plugin successfully', async () => {
    const testId = pluginId('ecmwf', 'anemoi-inference')

    worker.use(
      http.post(API_ENDPOINTS.plugin.uninstall, () => {
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const result = useUninstallPlugin()
      return (
        <div>
          <button data-testid="uninstall" onClick={() => result.mutate(testId)}>
            Uninstall
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('uninstall').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
  })
})

describe('useEnablePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('enables plugin successfully', async () => {
    const testId = pluginId('ecmwf', 'anemoi-inference')

    worker.use(
      http.post(API_ENDPOINTS.plugin.modifyEnabled, () => {
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const result = useEnablePlugin()
      return (
        <div>
          <button data-testid="enable" onClick={() => result.mutate(testId)}>
            Enable
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('enable').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
  })
})

describe('useDisablePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('disables plugin successfully', async () => {
    const testId = pluginId('ecmwf', 'anemoi-inference')

    worker.use(
      http.post(API_ENDPOINTS.plugin.modifyEnabled, () => {
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const result = useDisablePlugin()
      return (
        <div>
          <button data-testid="disable" onClick={() => result.mutate(testId)}>
            Disable
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('disable').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
  })
})

describe('useUpdatePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('updates plugin successfully', async () => {
    const testId = pluginId('ecmwf', 'anemoi-inference')

    worker.use(
      http.post(API_ENDPOINTS.plugin.update, () => {
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const result = useUpdatePlugin()
      return (
        <div>
          <button data-testid="update" onClick={() => result.mutate(testId)}>
            Update
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('update').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
  })
})
