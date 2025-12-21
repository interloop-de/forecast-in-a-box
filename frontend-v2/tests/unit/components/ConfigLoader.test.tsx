/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ConfigLoader } from '@/components/ConfigLoader'

// Store mock state globally so vi.mock can access it
const mockLoadConfig = vi.fn()
vi.fn()
// Use window to store mock state (accessible to hoisted vi.mock)
declare global {
  interface Window {
    __mockConfigStoreState: {
      isLoaded: boolean
      isLoading: boolean
      error: Error | null
      loadConfig: typeof mockLoadConfig
      config: unknown
      source: string | null
    }
  }
}

window.__mockConfigStoreState = {
  isLoaded: false,
  isLoading: false,
  error: null,
  loadConfig: mockLoadConfig,
  config: null,
  source: null,
}

// Mock the configStore
vi.mock('@/stores/configStore', () => {
  const useConfigStore = (
    selector?: (state: typeof window.__mockConfigStoreState) => unknown,
  ) => {
    if (selector) {
      return selector(window.__mockConfigStoreState)
    }
    return window.__mockConfigStoreState
  }
  useConfigStore.getState = () => ({
    ...window.__mockConfigStoreState,
    setError: vi.fn(),
  })

  return {
    useConfigStore,
    selectIsConfigReady: (state: typeof window.__mockConfigStoreState) =>
      state.isLoaded && !state.isLoading,
  }
})

// Mock LoadingSplashScreen
vi.mock('@/components/LoadingSplashScreen.tsx', () => ({
  LoadingSplashScreen: ({
    error,
    onRetry,
  }: {
    error?: string
    onRetry?: () => void
  }) => (
    <div data-testid="loading-splash">
      {error ? (
        <>
          <span data-testid="error-message">{error}</span>
          {onRetry && (
            <button data-testid="retry-button" onClick={onRetry}>
              Retry
            </button>
          )}
        </>
      ) : (
        <span data-testid="loading-indicator">Loading...</span>
      )}
    </div>
  ),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('ConfigLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadConfig.mockResolvedValue(undefined)
    // Reset store state
    window.__mockConfigStoreState = {
      isLoaded: false,
      isLoading: false,
      error: null,
      loadConfig: mockLoadConfig,
      config: null,
      source: null,
    }
  })

  describe('loading state', () => {
    it('shows loading splash when loading and not loaded', async () => {
      window.__mockConfigStoreState.isLoading = true
      window.__mockConfigStoreState.isLoaded = false

      const screen = await render(
        <ConfigLoader>
          <div data-testid="app-content">App Content</div>
        </ConfigLoader>,
      )

      await expect.element(screen.getByTestId('loading-splash')).toBeVisible()
      await expect
        .element(screen.getByTestId('loading-indicator'))
        .toBeVisible()
    })

    it('calls loadConfig on mount when not loaded', async () => {
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = false

      await render(
        <ConfigLoader>
          <div>App Content</div>
        </ConfigLoader>,
      )

      expect(mockLoadConfig).toHaveBeenCalled()
    })

    it('does not call loadConfig when already loading', async () => {
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = true

      await render(
        <ConfigLoader>
          <div>App Content</div>
        </ConfigLoader>,
      )

      expect(mockLoadConfig).not.toHaveBeenCalled()
    })

    it('does not call loadConfig when already loaded', async () => {
      window.__mockConfigStoreState.isLoaded = true
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.config = {
        language_iso639_1: 'en',
        authType: 'anonymous',
        loginEndpoint: null,
      }

      await render(
        <ConfigLoader>
          <div>App Content</div>
        </ConfigLoader>,
      )

      expect(mockLoadConfig).not.toHaveBeenCalled()
    })
  })

  describe('success state', () => {
    it('renders children when config is loaded', async () => {
      window.__mockConfigStoreState.isLoaded = true
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.config = {
        language_iso639_1: 'en',
        authType: 'anonymous',
        loginEndpoint: null,
      }

      const screen = await render(
        <ConfigLoader>
          <div data-testid="app-content">App Content</div>
        </ConfigLoader>,
      )

      await expect.element(screen.getByTestId('app-content')).toBeVisible()
      await expect.element(screen.getByText('App Content')).toBeVisible()
    })
  })

  describe('error state', () => {
    it('shows error screen when error occurs and config not ready', async () => {
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.error = new Error('Failed to load config')

      const screen = await render(
        <ConfigLoader>
          <div data-testid="app-content">App Content</div>
        </ConfigLoader>,
      )

      await expect.element(screen.getByTestId('loading-splash')).toBeVisible()
      await expect.element(screen.getByTestId('error-message')).toBeVisible()
      await expect
        .element(screen.getByText('Failed to load config'))
        .toBeVisible()
    })

    it('shows retry button on error', async () => {
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.error = new Error('Config error')

      const screen = await render(
        <ConfigLoader>
          <div>App Content</div>
        </ConfigLoader>,
      )

      await expect.element(screen.getByTestId('retry-button')).toBeVisible()
    })

    it('calls loadConfig when retry is clicked', async () => {
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.error = new Error('Config error')

      // Reset the call count before rendering
      mockLoadConfig.mockClear()

      const screen = await render(
        <ConfigLoader>
          <div>App Content</div>
        </ConfigLoader>,
      )

      const retryButton = screen.getByTestId('retry-button')
      await retryButton.click()

      // Should have called loadConfig (initial call + retry)
      expect(mockLoadConfig).toHaveBeenCalled()
    })
  })

  describe('fallback state', () => {
    it('shows loading splash as fallback', async () => {
      // Edge case: not loading, not loaded, no error, no config
      window.__mockConfigStoreState.isLoaded = false
      window.__mockConfigStoreState.isLoading = false
      window.__mockConfigStoreState.error = null
      window.__mockConfigStoreState.config = null

      const screen = await render(
        <ConfigLoader>
          <div data-testid="app-content">App Content</div>
        </ConfigLoader>,
      )

      await expect.element(screen.getByTestId('loading-splash')).toBeVisible()
    })
  })
})
