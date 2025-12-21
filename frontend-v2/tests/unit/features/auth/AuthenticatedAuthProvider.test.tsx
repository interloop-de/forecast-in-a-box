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
 * Note: These tests may produce "not wrapped in act(...)" warnings.
 * This is a known limitation of vitest-browser-react with components
 * that have async useEffect hooks. The warnings don't affect test
 * correctness - the tests properly wait for state changes using
 * async element assertions.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { AuthenticatedAuthProvider } from '@/features/auth/AuthenticatedAuthProvider'
import { useAuth } from '@/features/auth/AuthContext'
import { STORAGE_KEYS } from '@/lib/storage-keys'

import { checkSession, getAuthorizationUrl, logout } from '@/api/endpoints/auth'

// Mock the API endpoints
vi.mock('@/api/endpoints/auth', () => ({
  checkSession: vi.fn(),
  getAuthorizationUrl: vi.fn(),
  logout: vi.fn(),
}))

// Mock the logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

const mockCheckSession = vi.mocked(checkSession)
const mockGetAuthorizationUrl = vi.mocked(getAuthorizationUrl)
const mockLogout = vi.mocked(logout)

// Test component to access auth context
function TestConsumer() {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading">{auth.isLoading ? 'true' : 'false'}</div>
      <div data-testid="authenticated">
        {auth.isAuthenticated ? 'true' : 'false'}
      </div>
      <div data-testid="authType">{auth.authType}</div>
    </div>
  )
}

describe('AuthenticatedAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Default mocks
    mockCheckSession.mockResolvedValue(false)
    mockGetAuthorizationUrl.mockResolvedValue('https://auth.example.com/login')
    mockLogout.mockResolvedValue(true)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('checks session on mount when no logout flag', async () => {
      mockCheckSession.mockResolvedValue(true)

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
        </AuthenticatedAuthProvider>,
      )

      // Wait for async initialization to complete
      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect
        .element(screen.getByTestId('authenticated'))
        .toHaveTextContent('true')
      expect(mockCheckSession).toHaveBeenCalled()
    })

    it('sets authenticated to true when session is valid', async () => {
      mockCheckSession.mockResolvedValue(true)

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
        </AuthenticatedAuthProvider>,
      )

      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect
        .element(screen.getByTestId('authenticated'))
        .toHaveTextContent('true')
    })

    it('sets authenticated to false when session is invalid', async () => {
      mockCheckSession.mockResolvedValue(false)

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
        </AuthenticatedAuthProvider>,
      )

      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect
        .element(screen.getByTestId('authenticated'))
        .toHaveTextContent('false')
    })

    it('skips session check when logout flag is set', async () => {
      localStorage.setItem(STORAGE_KEYS.auth.logoutFlag, 'true')

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
        </AuthenticatedAuthProvider>,
      )

      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect
        .element(screen.getByTestId('authenticated'))
        .toHaveTextContent('false')
      expect(mockCheckSession).not.toHaveBeenCalled()
    })
  })

  describe('context value', () => {
    it('provides authType as authenticated', async () => {
      mockCheckSession.mockResolvedValue(false)

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
        </AuthenticatedAuthProvider>,
      )

      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect
        .element(screen.getByTestId('authType'))
        .toHaveTextContent('authenticated')
    })
  })

  describe('children rendering', () => {
    it('renders children', async () => {
      mockCheckSession.mockResolvedValue(false)

      const screen = await render(
        <AuthenticatedAuthProvider loginEndpoint="/auth/login">
          <TestConsumer />
          <div data-testid="child">Child Content</div>
        </AuthenticatedAuthProvider>,
      )

      await expect
        .element(screen.getByTestId('loading'))
        .toHaveTextContent('false')
      await expect.element(screen.getByTestId('child')).toBeInTheDocument()
      await expect
        .element(screen.getByTestId('child'))
        .toHaveTextContent('Child Content')
    })
  })
})
