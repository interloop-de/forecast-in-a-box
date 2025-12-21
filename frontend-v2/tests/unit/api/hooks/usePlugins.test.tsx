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
import {
  pluginKeys,
  useAddPluginStore,
  useCheckForUpdates,
  useDisablePlugin,
  useEnablePlugin,
  useInstallPlugin,
  usePlugins,
  useUninstallPlugin,
  useUpdatePlugin,
} from '@/api/hooks/usePlugins'
import { API_ENDPOINTS } from '@/api/endpoints'

// Mock the env module
vi.mock('@/utils/env', () => ({
  getBackendBaseUrl: vi.fn(() => ''),
}))

const mockPluginsResponse = {
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
    expect(pluginKeys.all).toEqual(['plugins'])
  })

  it('generates correct list key', () => {
    expect(pluginKeys.list()).toEqual(['plugins', 'list'])
  })

  it('generates correct stores key', () => {
    expect(pluginKeys.stores()).toEqual(['plugins', 'stores'])
  })
})

describe('usePlugins', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches plugins successfully', async () => {
    worker.use(
      http.get(API_ENDPOINTS.plugins.list, () => {
        return HttpResponse.json(mockPluginsResponse)
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
    expect(capturedData!.data?.plugins).toHaveLength(1)
    expect(capturedData!.data?.stores).toHaveLength(1)
  })

  it('handles error state', async () => {
    worker.use(
      http.get(API_ENDPOINTS.plugins.list, () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 })
      }),
    )

    function TestComponent() {
      const result = usePlugins()
      return (
        <div data-testid="error">{result.isError ? 'error' : 'no-error'}</div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect.element(screen.getByTestId('error')).toHaveTextContent('error')
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
    worker.use(
      http.post(API_ENDPOINTS.plugins.install('plugin-1'), () => {
        return HttpResponse.json({ success: true, pluginId: 'plugin-1' })
      }),
    )

    let mutationResult: ReturnType<typeof useInstallPlugin> | null = null

    function TestComponent() {
      const result = useInstallPlugin()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="install"
            onClick={() => result.mutate('plugin-1')}
          >
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
    expect(mutationResult!.data?.success).toBe(true)
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
    worker.use(
      http.post(API_ENDPOINTS.plugins.uninstall('plugin-1'), () => {
        return HttpResponse.json({ success: true })
      }),
    )

    let mutationResult: ReturnType<typeof useUninstallPlugin> | null = null

    function TestComponent() {
      const result = useUninstallPlugin()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="uninstall"
            onClick={() => result.mutate('plugin-1')}
          >
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
    expect(mutationResult!.data?.success).toBe(true)
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
    worker.use(
      http.post(API_ENDPOINTS.plugins.enable('plugin-1'), () => {
        return HttpResponse.json({ success: true })
      }),
    )

    let mutationResult: ReturnType<typeof useEnablePlugin> | null = null

    function TestComponent() {
      const result = useEnablePlugin()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="enable"
            onClick={() => result.mutate('plugin-1')}
          >
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
    expect(mutationResult!.data?.success).toBe(true)
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
    worker.use(
      http.post(API_ENDPOINTS.plugins.disable('plugin-1'), () => {
        return HttpResponse.json({ success: true })
      }),
    )

    let mutationResult: ReturnType<typeof useDisablePlugin> | null = null

    function TestComponent() {
      const result = useDisablePlugin()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="disable"
            onClick={() => result.mutate('plugin-1')}
          >
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
    expect(mutationResult!.data?.success).toBe(true)
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
    worker.use(
      http.post(API_ENDPOINTS.plugins.update('plugin-1'), () => {
        return HttpResponse.json({ success: true })
      }),
    )

    let mutationResult: ReturnType<typeof useUpdatePlugin> | null = null

    function TestComponent() {
      const result = useUpdatePlugin()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="update"
            onClick={() => result.mutate('plugin-1')}
          >
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
    expect(mutationResult!.data?.success).toBe(true)
  })
})

describe('useCheckForUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('checks for updates successfully', async () => {
    worker.use(
      http.post(API_ENDPOINTS.plugins.checkUpdates, () => {
        return HttpResponse.json({
          success: true,
          updatesCount: 2,
          plugins: [],
        })
      }),
    )

    function TestComponent() {
      const result = useCheckForUpdates()
      return (
        <div>
          <button data-testid="check" onClick={() => result.mutate()}>
            Check
          </button>
          <div data-testid="status">{result.status}</div>
          <div data-testid="count">{result.data?.updatesCount ?? 'none'}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('check').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    await expect.element(screen.getByTestId('count')).toHaveTextContent('2')
  })
})

describe('useAddPluginStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('adds plugin store successfully', async () => {
    worker.use(
      http.post(API_ENDPOINTS.plugins.addPluginStore, () => {
        return HttpResponse.json({
          success: true,
          store: {
            id: 'new-store',
            name: 'New Store',
            url: 'https://new-store.example.com',
            isDefault: false,
            isConnected: true,
            pluginsCount: 0,
          },
        })
      }),
    )

    let mutationResult: ReturnType<typeof useAddPluginStore> | null = null

    function TestComponent() {
      const result = useAddPluginStore()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="add"
            onClick={() =>
              result.mutate({
                name: 'New Store',
                url: 'https://new-store.example.com',
              })
            }
          >
            Add
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('add').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.store?.name).toBe('New Store')
  })
})
