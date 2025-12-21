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
  registriesKeys,
  sourcesKeys,
  useAddRegistry,
  useConfigureSource,
  useDisableSource,
  useDownloadSource,
  useEnableSource,
  useRemoveRegistry,
  useRemoveSource,
  useSource,
  useSources,
  useSyncRegistry,
  useToggleSourceEnabled,
} from '@/api/hooks/useSources'
import { API_ENDPOINTS } from '@/api/endpoints'

// Mock the env module
vi.mock('@/utils/env', () => ({
  getBackendBaseUrl: vi.fn(() => ''),
}))

const mockSourcesResponse = {
  sources: [
    {
      id: 'source-1',
      name: 'Test Source',
      type: 'model',
      plugin: 'core-plugin',
      status: 'active',
      isEnabled: true,
      description: 'A test source',
      version: '1.0.0',
    },
  ],
  registries: [
    {
      id: 'registry-1',
      name: 'Test Registry',
      url: 'https://registry.example.com',
      isDefault: true,
      isConnected: true,
      sourcesCount: 5,
      lastSyncedAt: '2025-01-01T00:00:00Z',
    },
  ],
}

const mockSourceDetail = {
  source: {
    id: 'source-1',
    name: 'Test Source',
    type: 'model',
    plugin: 'core-plugin',
    status: 'active',
    isEnabled: true,
    description: 'A test source',
    version: '1.0.0',
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

describe('sourcesKeys', () => {
  it('generates correct all key', () => {
    expect(sourcesKeys.all).toEqual(['sources'])
  })

  it('generates correct lists key', () => {
    expect(sourcesKeys.lists()).toEqual(['sources', 'list'])
  })

  it('generates correct list key with filters', () => {
    expect(sourcesKeys.list({ type: 'model' })).toEqual([
      'sources',
      'list',
      { type: 'model' },
    ])
  })

  it('generates correct details key', () => {
    expect(sourcesKeys.details()).toEqual(['sources', 'detail'])
  })

  it('generates correct detail key', () => {
    expect(sourcesKeys.detail('source-1')).toEqual([
      'sources',
      'detail',
      'source-1',
    ])
  })
})

describe('registriesKeys', () => {
  it('generates correct all key', () => {
    expect(registriesKeys.all).toEqual(['registries'])
  })

  it('generates correct lists key', () => {
    expect(registriesKeys.lists()).toEqual(['registries', 'list'])
  })

  it('generates correct list key', () => {
    expect(registriesKeys.list()).toEqual(['registries', 'list'])
  })

  it('generates correct details key', () => {
    expect(registriesKeys.details()).toEqual(['registries', 'detail'])
  })

  it('generates correct detail key', () => {
    expect(registriesKeys.detail('registry-1')).toEqual([
      'registries',
      'detail',
      'registry-1',
    ])
  })
})

describe('useSources', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches sources successfully', async () => {
    worker.use(
      http.get(API_ENDPOINTS.sources.list, () => {
        return HttpResponse.json(mockSourcesResponse)
      }),
    )

    let capturedData: ReturnType<typeof useSources> | null = null

    function TestComponent() {
      const result = useSources()
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
    expect(capturedData!.data?.sources).toHaveLength(1)
    expect(capturedData!.data?.registries).toHaveLength(1)
  })

  it('handles error state', async () => {
    worker.use(
      http.get(API_ENDPOINTS.sources.list, () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 })
      }),
    )

    function TestComponent() {
      const result = useSources()
      return (
        <div data-testid="error">{result.isError ? 'error' : 'no-error'}</div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect.element(screen.getByTestId('error')).toHaveTextContent('error')
  })
})

describe('useSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('fetches single source successfully', async () => {
    worker.use(
      http.get(API_ENDPOINTS.sources.byId('source-1'), () => {
        return HttpResponse.json(mockSourceDetail)
      }),
    )

    let capturedData: ReturnType<typeof useSource> | null = null

    function TestComponent() {
      const result = useSource('source-1')
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
    expect(capturedData!.data?.name).toBe('Test Source')
  })

  it('does not fetch when sourceId is empty', async () => {
    let fetchCalled = false

    worker.use(
      http.get(API_ENDPOINTS.sources.byId(''), () => {
        fetchCalled = true
        return HttpResponse.json(mockSourceDetail)
      }),
    )

    function TestComponent() {
      const result = useSource('')
      return <div data-testid="status">{result.fetchStatus}</div>
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await expect.element(screen.getByTestId('status')).toHaveTextContent('idle')
    expect(fetchCalled).toBe(false)
  })
})

describe('useDownloadSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('downloads source successfully', async () => {
    worker.use(
      http.post(API_ENDPOINTS.sources.download('source-1'), () => {
        return HttpResponse.json({ success: true, message: 'Downloaded' })
      }),
    )

    let mutationResult: ReturnType<typeof useDownloadSource> | null = null

    function TestComponent() {
      const result = useDownloadSource()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="download"
            onClick={() => result.mutate('source-1')}
          >
            Download
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('download').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.success).toBe(true)
  })
})

describe('useEnableSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('enables source successfully', async () => {
    worker.use(
      http.put(API_ENDPOINTS.sources.enable('source-1'), () => {
        return HttpResponse.json({ success: true, message: 'Enabled' })
      }),
    )

    let mutationResult: ReturnType<typeof useEnableSource> | null = null

    function TestComponent() {
      const result = useEnableSource()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="enable"
            onClick={() => result.mutate('source-1')}
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

describe('useDisableSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('disables source successfully', async () => {
    worker.use(
      http.put(API_ENDPOINTS.sources.disable('source-1'), () => {
        return HttpResponse.json({ success: true, message: 'Disabled' })
      }),
    )

    let mutationResult: ReturnType<typeof useDisableSource> | null = null

    function TestComponent() {
      const result = useDisableSource()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="disable"
            onClick={() => result.mutate('source-1')}
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

describe('useConfigureSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('configures source successfully', async () => {
    worker.use(
      http.put(API_ENDPOINTS.sources.configure('source-1'), () => {
        return HttpResponse.json({ success: true, message: 'Configured' })
      }),
    )

    let mutationResult: ReturnType<typeof useConfigureSource> | null = null

    function TestComponent() {
      const result = useConfigureSource()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="configure"
            onClick={() =>
              result.mutate({
                sourceId: 'source-1',
                configurationValues: { key: 'value' },
              })
            }
          >
            Configure
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('configure').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.success).toBe(true)
  })
})

describe('useRemoveSource', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('removes source successfully', async () => {
    worker.use(
      http.delete(API_ENDPOINTS.sources.byId('source-1'), () => {
        return HttpResponse.json({ success: true, message: 'Removed' })
      }),
    )

    let mutationResult: ReturnType<typeof useRemoveSource> | null = null

    function TestComponent() {
      const result = useRemoveSource()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="remove"
            onClick={() => result.mutate('source-1')}
          >
            Remove
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('remove').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.success).toBe(true)
  })
})

describe('useToggleSourceEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('enables source when enabled is true', async () => {
    let enableCalled = false

    worker.use(
      http.put(API_ENDPOINTS.sources.enable('source-1'), () => {
        enableCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const { mutate } = useToggleSourceEnabled()
      return (
        <button data-testid="toggle" onClick={() => mutate('source-1', true)}>
          Toggle
        </button>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('toggle').click()

    // Wait for mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(enableCalled).toBe(true)
  })

  it('disables source when enabled is false', async () => {
    let disableCalled = false

    worker.use(
      http.put(API_ENDPOINTS.sources.disable('source-1'), () => {
        disableCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const { mutate } = useToggleSourceEnabled()
      return (
        <button data-testid="toggle" onClick={() => mutate('source-1', false)}>
          Toggle
        </button>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('toggle').click()

    // Wait for mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(disableCalled).toBe(true)
  })

  it('reports pending state', async () => {
    worker.use(
      http.put(API_ENDPOINTS.sources.enable('source-1'), async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json({ success: true })
      }),
    )

    function TestComponent() {
      const { mutate, isPending } = useToggleSourceEnabled()

      return (
        <div>
          <button
            data-testid="toggle"
            onClick={() => {
              mutate('source-1', true)
            }}
          >
            Toggle
          </button>
          <div data-testid="pending">{isPending ? 'pending' : 'idle'}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('toggle').click()

    // Should show pending state during mutation
    await expect
      .element(screen.getByTestId('pending'))
      .toHaveTextContent('pending')
  })
})

describe('useAddRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('adds registry successfully', async () => {
    worker.use(
      http.post(API_ENDPOINTS.registries.add, () => {
        return HttpResponse.json({
          success: true,
          message: 'Added',
          registry: {
            id: 'new-registry',
            name: 'New Registry',
            url: 'https://new-registry.example.com',
            isDefault: false,
            isConnected: true,
            sourcesCount: 0,
            lastSyncedAt: null,
          },
        })
      }),
    )

    let mutationResult: ReturnType<typeof useAddRegistry> | null = null

    function TestComponent() {
      const result = useAddRegistry()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="add"
            onClick={() =>
              result.mutate({
                name: 'New Registry',
                url: 'https://new-registry.example.com',
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
    expect(mutationResult!.data!.registry.name).toBe('New Registry')
  })
})

describe('useRemoveRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('removes registry successfully', async () => {
    worker.use(
      http.delete(API_ENDPOINTS.registries.remove('registry-1'), () => {
        return HttpResponse.json({ success: true, message: 'Removed' })
      }),
    )

    let mutationResult: ReturnType<typeof useRemoveRegistry> | null = null

    function TestComponent() {
      const result = useRemoveRegistry()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="remove"
            onClick={() => result.mutate('registry-1')}
          >
            Remove
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('remove').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.success).toBe(true)
  })
})

describe('useSyncRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('syncs registry successfully', async () => {
    worker.use(
      http.post(API_ENDPOINTS.registries.sync('registry-1'), () => {
        return HttpResponse.json({
          success: true,
          message: 'Synced',
          lastSyncedAt: '2025-01-15T12:00:00Z',
        })
      }),
    )

    let mutationResult: ReturnType<typeof useSyncRegistry> | null = null

    function TestComponent() {
      const result = useSyncRegistry()
      mutationResult = result
      return (
        <div>
          <button
            data-testid="sync"
            onClick={() => result.mutate('registry-1')}
          >
            Sync
          </button>
          <div data-testid="status">{result.status}</div>
        </div>
      )
    }

    const screen = await renderWithQueryClient(<TestComponent />)

    await screen.getByTestId('sync').click()

    await expect
      .element(screen.getByTestId('status'))
      .toHaveTextContent('success')
    expect(mutationResult!.data?.lastSyncedAt).toBe('2025-01-15T12:00:00Z')
  })
})
