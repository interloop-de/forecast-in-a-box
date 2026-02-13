/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { AppConfig } from '@/types/config.types'
import { AuthProvider } from '@/features/auth/AuthProvider'

// Get the mocked useConfig
import { useConfig } from '@/hooks/useConfig'

// Track which provider was rendered
let renderedProvider: 'anonymous' | 'authenticated' | null = null
let authenticatedLoginEndpoint: string | null = null

// Mock useConfig hook
vi.mock('@/hooks/useConfig', () => ({
  useConfig: vi.fn(() => null),
}))

// Mock child providers
vi.mock('@/features/auth/AnonymousAuthProvider.tsx', () => ({
  AnonymousAuthProvider: ({ children }: { children: React.ReactNode }) => {
    renderedProvider = 'anonymous'
    return <div data-testid="anonymous-provider">{children}</div>
  },
}))

vi.mock('@/features/auth/AuthenticatedAuthProvider.tsx', () => ({
  AuthenticatedAuthProvider: ({
    children,
    loginEndpoint,
  }: {
    children: React.ReactNode
    loginEndpoint: string
  }) => {
    renderedProvider = 'authenticated'
    authenticatedLoginEndpoint = loginEndpoint
    return <div data-testid="authenticated-provider">{children}</div>
  },
}))
const mockUseConfig = vi.mocked(useConfig)

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    renderedProvider = null
    authenticatedLoginEndpoint = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when config is loading', () => {
    it('returns null when config is not loaded', async () => {
      mockUseConfig.mockReturnValue(null)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      // Should not render anything
      expect(
        screen.container.querySelector('[data-testid="child"]'),
      ).toBeFalsy()
      expect(renderedProvider).toBe(null)
    })
  })

  describe('when authType is anonymous', () => {
    it('renders AnonymousAuthProvider', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'anonymous',
        language_iso639_1: 'en',
        loginEndpoint: null,
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      await expect
        .element(screen.getByTestId('anonymous-provider'))
        .toBeInTheDocument()
      await expect.element(screen.getByTestId('child')).toBeInTheDocument()
      expect(renderedProvider).toBe('anonymous')
    })
  })

  describe('when authType is authenticated', () => {
    it('renders AuthenticatedAuthProvider with loginEndpoint', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'authenticated',
        language_iso639_1: 'en',
        loginEndpoint: '/auth/login',
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      await expect
        .element(screen.getByTestId('authenticated-provider'))
        .toBeInTheDocument()
      await expect.element(screen.getByTestId('child')).toBeInTheDocument()
      expect(renderedProvider).toBe('authenticated')
      expect(authenticatedLoginEndpoint).toBe('/auth/login')
    })

    it('falls back to AnonymousAuthProvider when loginEndpoint is missing', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'authenticated',
        language_iso639_1: 'en',
        loginEndpoint: null,
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      await expect
        .element(screen.getByTestId('anonymous-provider'))
        .toBeInTheDocument()
      expect(renderedProvider).toBe('anonymous')
    })

    it('falls back to AnonymousAuthProvider when loginEndpoint is empty string', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'authenticated',
        language_iso639_1: 'en',
        loginEndpoint: '',
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      await expect
        .element(screen.getByTestId('anonymous-provider'))
        .toBeInTheDocument()
      expect(renderedProvider).toBe('anonymous')
    })
  })

  describe('when authType is unknown', () => {
    it('falls back to AnonymousAuthProvider and logs error', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'unknown-auth-type' as 'anonymous',
        language_iso639_1: 'en',
        loginEndpoint: null,
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="child">Child Content</div>
        </AuthProvider>,
      )

      await expect
        .element(screen.getByTestId('anonymous-provider'))
        .toBeInTheDocument()
      expect(renderedProvider).toBe('anonymous')
    })
  })

  describe('children rendering', () => {
    it('passes children to the selected provider', async () => {
      mockUseConfig.mockReturnValue({
        authType: 'anonymous',
        language_iso639_1: 'en',
        loginEndpoint: null,
      } as AppConfig)

      const screen = await render(
        <AuthProvider>
          <div data-testid="nested">
            <span data-testid="deep-child">Deep Child</span>
          </div>
        </AuthProvider>,
      )

      await expect.element(screen.getByTestId('nested')).toBeInTheDocument()
      await expect.element(screen.getByTestId('deep-child')).toBeInTheDocument()
      await expect
        .element(screen.getByTestId('deep-child'))
        .toHaveTextContent('Deep Child')
    })
  })
})
