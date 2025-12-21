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
import { statusQueryKey, useStatus } from '@/api/hooks/useStatus'
import { API_ENDPOINTS } from '@/api/endpoints'

// Mock the env module
vi.mock('@/utils/env', () => ({
  getBackendBaseUrl: vi.fn(() => ''),
}))

const mockStatusResponse = {
  version: '1.0.0',
  api: 'up',
  cascade: 'up',
  ecmwf: 'up',
  scheduler: 'up',
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function TestComponent({
  onData,
}: {
  onData: (data: ReturnType<typeof useStatus>) => void
}) {
  const result = useStatus()
  onData(result)
  return (
    <div>
      <span data-testid="loading">
        {result.isLoading ? 'loading' : 'not-loading'}
      </span>
      <span data-testid="version">{result.version || 'no-version'}</span>
      <span data-testid="status">{result.trafficLightStatus}</span>
    </div>
  )
}

function renderWithQueryClient(
  ui: ReactNode,
  queryClient: QueryClient = createTestQueryClient(),
) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('useStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('has correct query key', () => {
    expect(statusQueryKey).toEqual(['status'])
  })

  it('fetches status and provides computed data', async () => {
    worker.use(
      http.get(API_ENDPOINTS.status, () => {
        return HttpResponse.json(mockStatusResponse)
      }),
    )

    let capturedData: ReturnType<typeof useStatus> | null = null

    const screen = await renderWithQueryClient(
      <TestComponent
        onData={(data) => {
          capturedData = data
        }}
      />,
    )

    // Wait for data to load
    await expect
      .element(screen.getByTestId('version'))
      .toHaveTextContent('1.0.0')

    expect(capturedData).not.toBeNull()
    expect(capturedData!.version).toBe('1.0.0')
    expect(capturedData!.isAllUp).toBe(true)
    expect(capturedData!.trafficLightStatus).toBe('green')
  })

  it('shows loading state initially', async () => {
    // Use a delayed response to observe loading state
    worker.use(
      http.get(API_ENDPOINTS.status, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json(mockStatusResponse)
      }),
    )

    const screen = await renderWithQueryClient(
      <TestComponent onData={() => {}} />,
    )

    // Initially should be loading
    await expect
      .element(screen.getByTestId('loading'))
      .toHaveTextContent('loading')
  })

  it('handles error state', async () => {
    worker.use(
      http.get(API_ENDPOINTS.status, () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 })
      }),
    )

    let capturedData: ReturnType<typeof useStatus> | null = null

    await renderWithQueryClient(
      <TestComponent
        onData={(data) => {
          capturedData = data
        }}
      />,
    )

    // Wait a bit for the query to fail
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(capturedData!.isError).toBe(true)
  })

  it('computes traffic light status correctly for partial outage', async () => {
    const partialOutageResponse = {
      version: '1.0.0',
      api: 'up',
      cascade: 'down',
      ecmwf: 'up',
      scheduler: 'up',
    }

    worker.use(
      http.get(API_ENDPOINTS.status, () => {
        return HttpResponse.json(partialOutageResponse)
      }),
    )

    let capturedData: ReturnType<typeof useStatus> | null = null

    const screen = await renderWithQueryClient(
      <TestComponent
        onData={(data) => {
          capturedData = data
        }}
      />,
    )

    // Wait for data to load
    await expect
      .element(screen.getByTestId('version'))
      .toHaveTextContent('1.0.0')

    expect(capturedData!.isPartialOutage).toBe(true)
    expect(capturedData!.trafficLightStatus).toBe('orange')
  })

  it('computes traffic light status correctly for all down', async () => {
    const allDownResponse = {
      version: '1.0.0',
      api: 'down',
      cascade: 'down',
      ecmwf: 'down',
      scheduler: 'down',
    }

    worker.use(
      http.get(API_ENDPOINTS.status, () => {
        return HttpResponse.json(allDownResponse)
      }),
    )

    let capturedData: ReturnType<typeof useStatus> | null = null

    const screen = await renderWithQueryClient(
      <TestComponent
        onData={(data) => {
          capturedData = data
        }}
      />,
    )

    // Wait for data to load
    await expect
      .element(screen.getByTestId('version'))
      .toHaveTextContent('1.0.0')

    expect(capturedData!.isAllDown).toBe(true)
    expect(capturedData!.trafficLightStatus).toBe('red')
  })
})
